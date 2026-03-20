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

import lombok.extern.slf4j.Slf4j;
import java.util.Collections;

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

    @Override
    @Transactional
    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                loginRequest.getUsernameOrEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtTokenProvider.generateToken(authentication);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(authentication.getName());

        User user = userRepository.findByUsernameOrEmail(loginRequest.getUsernameOrEmail(), loginRequest.getUsernameOrEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username or email : " + loginRequest.getUsernameOrEmail()));

        JwtResponse jwtResponse = new JwtResponse();
        jwtResponse.setAccessToken(token);
        jwtResponse.setRefreshToken(refreshToken.getToken());
        jwtResponse.setUsername(user.getUsername());
        jwtResponse.setEmail(user.getEmail());
        jwtResponse.setFullName(user.getFullName());
        jwtResponse.setRoles(user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(java.util.stream.Collectors.toList()));
        
        log.info("Security Audit: User '{}' successfully authenticated via neural link.", user.getUsername());
        return jwtResponse;
    }

    @Override
    @Transactional
    public String register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BusinessLogicException("Access Regret: This username is already indexed in our registry.");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BusinessLogicException("Access Regret: This email address is already registered.");
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .fullName(registerRequest.getFullName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .build();

        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseThrow(() -> new ResourceNotFoundException("Authority Error: Required security role not found in system."));
        user.setRoles(Collections.singleton(adminRole));

        userRepository.save(user);
        log.info("Registry Synergy: New identity '{}' successfully indexed in the security perimeter.", user.getUsername());
        return "User registered successfully!";
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
