package com.formcraft.service.impl;

import com.formcraft.dto.request.LoginRequest;
import com.formcraft.dto.request.RegisterRequest;
import com.formcraft.dto.response.JwtResponse;
import com.formcraft.entity.RefreshToken;
import com.formcraft.entity.Role;
import com.formcraft.entity.User;
import com.formcraft.exception.BusinessLogicException;
import com.formcraft.exception.ResourceNotFoundException;
import com.formcraft.repository.RoleRepository;
import com.formcraft.repository.UserRepository;
import com.formcraft.security.jwt.JwtTokenProvider;
import com.formcraft.service.AuthService;
import com.formcraft.service.RefreshTokenService;
import com.formcraft.util.RoleName;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.formcraft.service.AuditService;

import lombok.extern.slf4j.Slf4j;
import java.util.Collections;

import com.formcraft.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import com.formcraft.exception.AccountLockedException;
import org.springframework.security.authentication.BadCredentialsException;

import java.time.LocalDateTime;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditService auditService;

    @org.springframework.context.annotation.Lazy
    @org.springframework.beans.factory.annotation.Autowired
    private AuthServiceImpl self;

    @Value("${app.otp-expiration-minutes:5}")
    private int otpExpirationMinutes;

    @Value("${app.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${app.lockout-duration-minutes:15}")
    private int lockoutDurationMinutes;

    @Override
    @Transactional
    public JwtResponse login(LoginRequest loginRequest) {
        String identifier = loginRequest.getUsernameOrEmail();
        User user = userRepository.findByUsernameOrEmail(loginRequest.getUsernameOrEmail(), loginRequest.getUsernameOrEmail())
                .orElseThrow(() -> new BusinessLogicException("User not found."));

        if (!user.isActive()) {
            throw new BusinessLogicException("Your account is not active. Please verify your email with the OTP.");
        }

        if (user.getLockoutTime() != null && user.getLockoutTime().isAfter(LocalDateTime.now())) {
            log.warn("Blocked login attempt: User '{}' is currently locked.", user.getUsername());
            throw new AccountLockedException("Your account is locked for 15 minutes due to too many failed attempts.");
        }

        try {
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    identifier, loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            return handleSuccessfulLogin(user, authentication);
        } catch (BadCredentialsException e) {
            self.handleFailedLogin(user.getId());
            auditService.log("USER_LOGIN_FAILED", user.getUsername(), "USER", user.getId(), "Failed login attempt");
            throw new BadCredentialsException("Error: Invalid password.");
        }
    }

    private JwtResponse handleSuccessfulLogin(User user, Authentication authentication) {
        // Reset failed login attempts on success
        user.setFailedLoginAttempts(0);
        user.setLockoutTime(null);
        userRepository.save(user);

        String token = jwtTokenProvider.generateToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUsername());

        JwtResponse jwtResponse = new JwtResponse();
        jwtResponse.setAccessToken(token);
        jwtResponse.setRefreshToken(refreshToken.getToken());
        jwtResponse.setUsername(user.getUsername());
        jwtResponse.setEmail(user.getEmail());
        jwtResponse.setFullName(user.getFullName());
        jwtResponse.setRoles(user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(java.util.stream.Collectors.toList()));
        
        auditService.log("USER_LOGIN", user.getUsername(), "USER", user.getId(), "User logged in successfully");
        log.info("User '{}' successfully authenticated.", user.getUsername());
        return jwtResponse;
    }

    @org.springframework.transaction.annotation.Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void handleFailedLogin(java.util.UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Error: User record not found."));
        
        user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
        if (user.getFailedLoginAttempts() >= maxFailedAttempts) {
            user.setLockoutTime(LocalDateTime.now().plusMinutes(lockoutDurationMinutes));
            log.warn("Account locked: User '{}' has been blocked for 15 minutes.", user.getUsername());
        } else {
            log.info("Failed login attempt for user '{}'. Total failures: {}.", user.getUsername(), user.getFailedLoginAttempts());
        }
        userRepository.save(user);
    }

    @Override
    @Transactional
    public String register(RegisterRequest registerRequest) {
        java.util.Optional<User> existingUserByEmail = userRepository.findByEmail(registerRequest.getEmail());
        
        if (existingUserByEmail.isPresent()) {
            User user = existingUserByEmail.get();
            if (user.isActive()) {
                throw new BusinessLogicException("Email already exists. Please log in.");
            }
            // Throw a specialized message for unverified accounts
            throw new BusinessLogicException("UNVERIFIED_ACCOUNT: Account already exists but is unverified.");
        }

        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BusinessLogicException("Username already exists.");
        }

        String otp = generateOtp();
        
        User user = User.builder()
                .username(registerRequest.getUsername())
                .fullName(registerRequest.getFullName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .otpCode(otp)
                .otpExpiry(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .isActive(false)
                .build();

        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException("Error: Default role not found."));
        user.setRoles(Collections.singleton(adminRole));

        userRepository.save(user);
        emailService.sendVerificationEmail(user.getEmail(), otp);
        
        auditService.log("USER_REGISTER", user.getUsername(), "USER", user.getId(), "New user account registered");
        log.info("Registration: New user '{}' awaiting email verification.", user.getUsername());
        return "Registration successful! Please check your email for the OTP.";
    }

    @Override
    @Transactional
    public void resendVerificationOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Error: User record with this email not found."));

        if (user.isActive()) {
            throw new BusinessLogicException("Account is already active. Please login.");
        }

        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(otpExpirationMinutes));
        userRepository.save(user);

        emailService.sendVerificationEmail(user.getEmail(), otp);
        log.info("Registration: Verification OTP resent to user '{}'.", user.getUsername());
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(1000000));
    }

    @Override
    @Transactional
    public JwtResponse verifyRegistrationOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Error: User not found."));

        if (user.isActive()) {
            throw new BusinessLogicException("Account is already active.");
        }

        validateOtp(user, otp);

        user.setActive(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        auditService.log("USER_VERIFY", user.getUsername(), "USER", user.getId(), "User verified account");
        log.info("Verification: Account '{}' activated successfully.", user.getUsername());

        // Perform manual authentication to generate tokens
        Authentication authentication = new UsernamePasswordAuthenticationToken(user.getUsername(), null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return handleSuccessfulLogin(user, authentication);
    }

    @Override
    @Transactional
    public void forgotPasswordRequest(String identity) {
        User user = userRepository.findByUsernameOrEmail(identity, identity)
                .orElseThrow(() -> new ResourceNotFoundException("Error: User not found."));

        if (!user.isActive()) {
            throw new BusinessLogicException("Account is unverified. Please verify your email first.");
        }

        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(otpExpirationMinutes));
        userRepository.save(user);

        emailService.sendForgotPasswordEmail(user.getEmail(), otp);
        log.info("Password Reset: OTP sent to user '{}'.", user.getUsername());
    }

    @Override
    @Transactional
    public JwtResponse resetPasswordWithOtp(String identity, String otp, String newPassword) {
        User user = userRepository.findByUsernameOrEmail(identity, identity)
                .orElseThrow(() -> new ResourceNotFoundException("Error: User not found."));

        validateOtp(user, otp);

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        // Requirement: Reset lockout if user uses forgot password
        user.setFailedLoginAttempts(0);
        user.setLockoutTime(null);
        
        userRepository.save(user);
        auditService.log("USER_PASSWORD_RESET", user.getUsername(), "USER", user.getId(), "User reset password");
        log.info("Password Reset: User '{}' successfully updated their password.", user.getUsername());

        // Log them in immediately
        Authentication authentication = new UsernamePasswordAuthenticationToken(user.getUsername(), null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return handleSuccessfulLogin(user, authentication);
    }

    private void validateOtp(User user, String otp) {
        if (user.getOtpCode() == null || !user.getOtpCode().equals(otp)) {
            throw new BusinessLogicException("Error: Invalid OTP code.");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new BusinessLogicException("Error: OTP code has expired.");
        }
    }

    @Override
    @Transactional
    public void logout() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            User user = userRepository.findByUsernameOrEmail(authentication.getName(), authentication.getName())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            refreshTokenService.deleteByUserId(user.getId());
        }
        SecurityContextHolder.clearContext();
    }
}
