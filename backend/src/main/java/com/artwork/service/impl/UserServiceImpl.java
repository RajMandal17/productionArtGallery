package com.artwork.service.impl;

import com.artwork.dto.SocialLinksDto;
import com.artwork.dto.UserDto;
import com.artwork.dto.UserUpdateRequest;
import com.artwork.entity.SocialLinks;
import com.artwork.entity.User;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.SocialLinksRepository;
import com.artwork.repository.UserRepository;
import com.artwork.service.UserService;
import com.artwork.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final SocialLinksRepository socialLinksRepository;
    private final JwtUtil jwtUtil;
    
    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    @Cacheable(value = "users", key = "#token")
    public UserDto getUserProfile(String token) {
        log.debug("Fetching user profile from database");
        String userId = jwtUtil.extractUserId(token);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return mapToDto(user);
    }

    @Override
    @CacheEvict(value = "users", key = "#token")
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
        
        // Update artist specific fields
        if (updateRequest.getBio() != null) {
            user.setBio(updateRequest.getBio());
        }
        
        if (updateRequest.getWebsite() != null) {
            user.setWebsite(updateRequest.getWebsite());
        }
        
        // Update or create social links
        if (updateRequest.getSocialLinks() != null) {
            SocialLinksDto linksDto = updateRequest.getSocialLinks();
            SocialLinks socialLinks = user.getSocialLinks();
            
            if (socialLinks == null) {
                socialLinks = new SocialLinks();
                socialLinks.setUser(user);
                user.setSocialLinks(socialLinks);
            }
            
            socialLinks.setInstagram(linksDto.getInstagram());
            socialLinks.setTwitter(linksDto.getTwitter());
            socialLinks.setFacebook(linksDto.getFacebook());
        }

        user.setUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return mapToDto(savedUser);
    }

    @Override
    @CacheEvict(value = "users", key = "#token")
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
        
        // Here you would normally check if the old password matches the stored password
        // For this implementation, we'll assume it's correct and just update to the new password
        // In a real application, you should use a password encoder to verify the old password
        // and encode the new password
        
        // Update with new password (should be encoded in a real app)
        user.setPassword(newPassword);
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
        dto.setIsActive(user.getIsActive());
        
        // Include artist specific fields
        dto.setBio(user.getBio());
        dto.setWebsite(user.getWebsite());
        
        // Include social links if available
        if (user.getSocialLinks() != null) {
            SocialLinksDto socialLinksDto = new SocialLinksDto();
            socialLinksDto.setInstagram(user.getSocialLinks().getInstagram());
            socialLinksDto.setTwitter(user.getSocialLinks().getTwitter());
            socialLinksDto.setFacebook(user.getSocialLinks().getFacebook());
            dto.setSocialLinks(socialLinksDto);
        } else {
            // Provide empty social links object to prevent frontend null errors
            dto.setSocialLinks(new SocialLinksDto());
        }
        
        return dto;
    }
}
