package com.artwork.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import com.artwork.entity.Role;

@Data
public class UserDto {
    private String id;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String role;
    private Boolean isActive;
    private String profileImage;
    private String createdAt;
    private String authorities; // For debugging role/authority issues
    
    // Artist specific fields
    private String bio;
    private String website;
    private SocialLinksDto socialLinks;
    private Long artworkCount;
    private Double averageRating;
}
