package com.artwork.service;

import com.artwork.dto.*;
import com.artwork.entity.Role;
import com.artwork.entity.User;
import com.artwork.repository.UserRepository;
import com.artwork.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final ModelMapper modelMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            AuthResponse response = new AuthResponse();
            response.setSuccess(false);
            response.setMessage("Email already registered");
            return response;
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole() != null ? request.getRole() : Role.CUSTOMER)
                .isActive(true)
                .build();
        userRepository.save(user);
        UserDto userDto = modelMapper.map(user, UserDto.class);
        Map<String, Object> claims = new HashMap<>();
        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name(), claims);
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail(), user.getRole().name());
        TokenDto tokenDto = new TokenDto();
        tokenDto.setAccessToken(accessToken);
        tokenDto.setRefreshToken(refreshToken);
        AuthResponse response = new AuthResponse();
        response.setSuccess(true);
        response.setMessage("User registered successfully");
        response.setUser(userDto);
        response.setTokens(tokenDto);

        // Set redirect URL based on user role
        if (user.getRole() == Role.ARTIST) {
            response.setRedirectUrl("/dashboard/artist");
        } else if (user.getRole() == Role.ADMIN) {
            response.setRedirectUrl("/dashboard/admin");
        } else if (user.getRole() == Role.CUSTOMER) {
            response.setRedirectUrl("/dashboard/customer");
        } else {
            response.setRedirectUrl("/");
        }

        return response;
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        AuthResponse response = new AuthResponse();
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            response.setSuccess(false);
            response.setMessage("Invalid credentials");
            return response;
        }
        UserDto userDto = modelMapper.map(user, UserDto.class);
        Map<String, Object> claims = new HashMap<>();
        String accessToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name(), claims);
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getEmail(), user.getRole().name());
        TokenDto tokenDto = new TokenDto();
        tokenDto.setAccessToken(accessToken);
        tokenDto.setRefreshToken(refreshToken);
        response.setSuccess(true);
        response.setMessage("Login successful");
        response.setUser(userDto);
        response.setTokens(tokenDto);

        // Set redirect URL based on user role
        if (user.getRole() == Role.ARTIST) {
            response.setRedirectUrl("/dashboard/artist");
        } else if (user.getRole() == Role.ADMIN) {
            response.setRedirectUrl("/dashboard/admin");
        } else if (user.getRole() == Role.CUSTOMER) {
            response.setRedirectUrl("/dashboard/customer");
        } else {
            response.setRedirectUrl("/");
        }

        return response;
    }

    public UserDto getUserByPrincipal(Principal principal) {
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        return modelMapper.map(user, UserDto.class);
    }
    
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByEmail(username).orElse(null);
        return modelMapper.map(user, UserDto.class);
    }
}
