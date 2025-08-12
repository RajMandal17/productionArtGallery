package com.artwork.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String firstName;
    private String lastName;
    private String bio;
    private String website;
    private SocialLinksDto socialLinks;
}
