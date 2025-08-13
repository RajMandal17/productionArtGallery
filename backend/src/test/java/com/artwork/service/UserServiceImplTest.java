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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.modelmapper.ModelMapper;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private SocialLinksRepository socialLinksRepository;
    
    @Mock
    private JwtUtil jwtUtil;
    
    @Mock
    private ModelMapper modelMapper;
    
    @InjectMocks
    private UserServiceImpl userService;
    
    private User testUser;
    private UserDto testUserDto;
    private String testToken;
    private String testUserId;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        
        testUserId = UUID.randomUUID().toString();
        testToken = "test-token";
        
        testUser = new User();
        testUser.setId(testUserId);
        testUser.setEmail("test@example.com");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setRole(Role.ARTIST);
        
        testUserDto = new UserDto();
        testUserDto.setId(testUserId);
        testUserDto.setEmail("test@example.com");
        testUserDto.setFirstName("Test");
        testUserDto.setLastName("User");
        testUserDto.setRole("ARTIST");
        
        when(jwtUtil.extractUserId(testToken)).thenReturn(testUserId);
        when(userRepository.findById(testUserId)).thenReturn(Optional.of(testUser));
        when(modelMapper.map(testUser, UserDto.class)).thenReturn(testUserDto);
    }
    
    @Test
    void getUserProfile_ValidToken_ReturnsUserDto() {
        // Act
        UserDto result = userService.getUserProfile(testToken);
        
        // Assert
        assertNotNull(result);
        assertEquals(testUserId, result.getId());
        assertEquals("test@example.com", result.getEmail());
        assertEquals("Test", result.getFirstName());
        assertEquals("User", result.getLastName());
        assertEquals("ARTIST", result.getRole());
        
        // Verify
        verify(jwtUtil).extractUserId(testToken);
        verify(userRepository).findById(testUserId);
        verify(modelMapper).map(testUser, UserDto.class);
    }
    
    @Test
    void getUserProfile_InvalidToken_ThrowsResourceNotFoundException() {
        // Arrange
        String invalidUserId = "invalid-id";
        String invalidToken = "invalid-token";
        when(jwtUtil.extractUserId(invalidToken)).thenReturn(invalidUserId);
        when(userRepository.findById(invalidUserId)).thenReturn(Optional.empty());
        
        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> userService.getUserProfile(invalidToken));
        
        // Verify
        verify(jwtUtil).extractUserId(invalidToken);
        verify(userRepository).findById(invalidUserId);
    }
    
    @Test
    void updateUserProfile_ValidRequest_ReturnsUpdatedUserDto() {
        // Arrange
        UserUpdateRequest updateRequest = new UserUpdateRequest();
        updateRequest.setFirstName("Updated");
        updateRequest.setLastName("Name");
        updateRequest.setBio("Artist bio");
        updateRequest.setWebsite("https://example.com");
        
        User updatedUser = new User();
        updatedUser.setId(testUserId);
        updatedUser.setEmail("test@example.com");
        updatedUser.setFirstName("Updated");
        updatedUser.setLastName("Name");
        updatedUser.setBio("Artist bio");
        updatedUser.setWebsite("https://example.com");
        
        UserDto updatedUserDto = new UserDto();
        updatedUserDto.setId(testUserId);
        updatedUserDto.setEmail("test@example.com");
        updatedUserDto.setFirstName("Updated");
        updatedUserDto.setLastName("Name");
        updatedUserDto.setBio("Artist bio");
        updatedUserDto.setWebsite("https://example.com");
        
        when(userRepository.save(any(User.class))).thenReturn(updatedUser);
        when(modelMapper.map(updatedUser, UserDto.class)).thenReturn(updatedUserDto);
        
        // Act
        UserDto result = userService.updateUserProfile(updateRequest, testToken);
        
        // Assert
        assertNotNull(result);
        assertEquals("Updated", result.getFirstName());
        assertEquals("Name", result.getLastName());
        assertEquals("Artist bio", result.getBio());
        assertEquals("https://example.com", result.getWebsite());
        
        // Verify
        verify(jwtUtil).extractUserId(testToken);
        verify(userRepository).findById(testUserId);
        verify(userRepository).save(any(User.class));
        verify(modelMapper).map(updatedUser, UserDto.class);
    }
}
