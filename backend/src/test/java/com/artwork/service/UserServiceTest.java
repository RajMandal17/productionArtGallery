package com.artwork.service;

import com.artwork.dto.UserDto;
import com.artwork.dto.UserUpdateRequest;
import com.artwork.entity.Role;
import com.artwork.entity.User;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.SocialLinksRepository;
import com.artwork.repository.UserRepository;
import com.artwork.service.impl.UserServiceImpl;
import com.artwork.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private SocialLinksRepository socialLinksRepository;
    
    @Mock
    private JwtUtil jwtUtil;
    
    @InjectMocks
    private UserServiceImpl userService;
    
    private User testUser;
    private String testToken = "test-token";
    private String testUserId = "user-123";
    
    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(testUserId)
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .role(Role.ARTIST)
                .bio("Test bio")
                .website("https://example.com")
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
                
        // Set private upload directory field
        ReflectionTestUtils.setField(userService, "uploadDir", "uploads");
    }
    
    @Test
    void getUserProfile_ShouldReturnUserDto_WhenUserExists() {
        // Arrange
        when(jwtUtil.extractUserId(testToken)).thenReturn(testUserId);
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        
        // Act
        UserDto result = userService.getUserProfile(testToken);
        
        // Assert
        assertNotNull(result);
        assertEquals(testUserId, result.getId());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("Test", result.getFirstName());
        assertEquals("User", result.getLastName());
        assertEquals("ARTIST", result.getRole());
        assertEquals("Test bio", result.getBio());
        assertEquals("https://example.com", result.getWebsite());
        
        // Verify
        verify(jwtUtil).extractUserId(testToken);
        verify(userRepository).findById(testUserId);
    }
    
    @Test
    void getUserProfile_ShouldThrowException_WhenUserDoesNotExist() {
        // Arrange
        when(jwtUtil.extractUserId(testToken)).thenReturn(testUserId);
        when(userRepository.findById(testUserId)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            userService.getUserProfile(testToken);
        });
        
        // Verify
        verify(jwtUtil).extractUserId(testToken);
        verify(userRepository).findById(testUserId);
    }
    
    @Test
    void updateUserProfile_ShouldUpdateUser_WhenRequestIsValid() {
        // Arrange
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setFirstName("Updated");
        updateRequest.setLastName("Name");
        updateRequest.setBio("Updated bio");
        updateRequest.setWebsite("https://updated.com");
        
        when(jwtUtil.extractUserId(testToken)).thenReturn(testUserId);
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        
        // Act
        UserDto result = userService.updateUserProfile(updateRequest, testToken);
        
        // Assert
        assertNotNull(result);
        assertEquals("Updated", testUser.getFirstName());
        assertEquals("Name", testUser.getLastName());
        assertEquals("Updated bio", testUser.getBio());
        assertEquals("https://updated.com", testUser.getWebsite());
        
        // Verify
        verify(jwtUtil).extractUserId(testToken);
        verify(userRepository).findById(testUserId);
        verify(userRepository).save(testUser);
    }
}
