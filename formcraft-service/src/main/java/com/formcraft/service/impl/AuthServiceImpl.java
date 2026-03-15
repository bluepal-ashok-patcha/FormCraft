package com.formcraft.service.impl;

import com.formcraft.dto.request.LoginRequest;
import com.formcraft.dto.request.RegisterRequest;
import com.formcraft.dto.response.JwtResponse;
import com.formcraft.entity.RefreshToken;
import com.formcraft.entity.Role;
import com.formcraft.entity.User;
import com.formcraft.exception.BadRequestException;
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

import java.util.Collections;

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
        
        return jwtResponse;
    }

    @Override
    @Transactional
    public String register(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already taken!");
        }

        User user = User.builder()
                .username(registerRequest.getUsername())
                .fullName(registerRequest.getFullName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .build();

        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseThrow(() -> new RuntimeException("Error: Admin Role not found."));
        user.setRoles(Collections.singleton(adminRole));

        userRepository.save(user);
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
