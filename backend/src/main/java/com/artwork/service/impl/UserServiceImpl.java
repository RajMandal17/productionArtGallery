package com.artwork.service.impl;

import com.artwork.dto.UserDto;
import com.artwork.dto.UserUpdateRequest;
import com.artwork.entity.User;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.UserRepository;
import com.artwork.service.UserService;
import com.artwork.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;
    
    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public UserDto getUserProfile(String token) {
        String userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return mapToDto(user);
    }

    @Override
    public UserDto updateUserProfile(UserUpdateRequest updateRequest, String token) {
        String userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Update user details
        if (updateRequest.getFirstName() != null) {
            user.setFirstName(updateRequest.getFirstName());
        }
        
        if (updateRequest.getLastName() != null) {
            user.setLastName(updateRequest.getLastName());
        }
        
        // Handle artist specific fields - stored as JSON in metadata column
        // Implementation depends on how user metadata is stored

        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    @Override
    public String updateProfileImage(MultipartFile image, String token) {
        try {
            String userId = jwtUtil.extractUserId(token);
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String filename = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            Path targetLocation = uploadPath.resolve(filename);
            
            // Copy file to target location
            Files.copy(image.getInputStream(), targetLocation);
            
            // Save image URL to user
            String imageUrl = "/uploads/" + filename;
            user.setProfileImage(imageUrl);
            userRepository.save(user);
            
            return imageUrl;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store profile image", ex);
        }
    }
    
    @Override
    public void changePassword(String oldPassword, String newPassword, String token) {
        String userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Verify the old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }
        
        // Set the new password with proper encoding
        user.setPassword(passwordEncoder.encode(newPassword));
        
        userRepository.save(user);
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setRole(user.getRole().name());
        dto.setProfileImage(user.getProfileImage());
        dto.setCreatedAt(user.getCreatedAt().toString());
        return dto;
    }
}
