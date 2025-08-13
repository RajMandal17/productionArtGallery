package com.artwork.service;

import com.artwork.dto.ArtworkDto;
import com.artwork.entity.Artwork;
import com.artwork.entity.User;
import com.artwork.repository.ArtworkRepository;
import com.artwork.service.impl.ArtworkServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ArtworkServiceTest {

    @Mock
    private ArtworkRepository artworkRepository;
    
    @Mock
    private ModelMapper modelMapper;
    
    @InjectMocks
    private ArtworkServiceImpl artworkService;
    
    private Artwork testArtwork;
    private ArtworkDto testArtworkDto;
    private User testArtist;
    private List<Artwork> artworkList;
    
    @BeforeEach
    void setUp() {
        testArtist = User.builder()
                .id("artist-123")
                .firstName("Artist")
                .lastName("Name")
                .build();
                
        testArtwork = Artwork.builder()
                .id("artwork-123")
                .title("Test Artwork")
                .description("Test Description")
                .price(100.0)
                .category("Painting")
                .medium("Oil")
                .artist(testArtist)
                .isAvailable(true)
                .createdAt(LocalDateTime.now())
                .build();
                
        testArtworkDto = new ArtworkDto();
        testArtworkDto.setId("artwork-123");
        testArtworkDto.setTitle("Test Artwork");
        testArtworkDto.setPrice(100.0);
        
        artworkList = new ArrayList<>();
        artworkList.add(testArtwork);
        
        // Set private upload directory field
        ReflectionTestUtils.setField(artworkService, "uploadDir", "uploads");
    }
    
    @Test
    void getArtworks_ShouldReturnPageOfArtworks() {
        // Arrange
        PageImpl<Artwork> artworkPage = new PageImpl<>(artworkList);
        when(artworkRepository.findAll(any(PageRequest.class))).thenReturn(artworkPage);
        when(modelMapper.map(any(Artwork.class), eq(ArtworkDto.class))).thenReturn(testArtworkDto);
        
        // Act
        Page<ArtworkDto> result = artworkService.getArtworks(1, 10, null, null, null, null, null);
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Test Artwork", result.getContent().get(0).getTitle());
        
        // Verify
        verify(artworkRepository).findAll(any(PageRequest.class));
    }
    
    @Test
    void getArtworkById_ShouldReturnArtwork_WhenExists() {
        // Arrange
        when(artworkRepository.findById("artwork-123")).thenReturn(Optional.of(testArtwork));
        when(modelMapper.map(testArtwork, ArtworkDto.class)).thenReturn(testArtworkDto);
        
        // Act
        ArtworkDto result = artworkService.getArtworkById("artwork-123");
        
        // Assert
        assertNotNull(result);
        assertEquals("Test Artwork", result.getTitle());
        
        // Verify
        verify(artworkRepository).findById("artwork-123");
    }
    
    @Test
    void getFeaturedArtworks_ShouldReturnListOfArtworks() {
        // Arrange
        PageImpl<Artwork> artworkPage = new PageImpl<>(artworkList);
        when(artworkRepository.findAll(any(PageRequest.class))).thenReturn(artworkPage);
        when(modelMapper.map(any(Artwork.class), eq(ArtworkDto.class))).thenReturn(testArtworkDto);
        
        // Act
        List<ArtworkDto> result = artworkService.getFeaturedArtworks();
        
        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Artwork", result.get(0).getTitle());
        
        // Verify
        verify(artworkRepository).findAll(any(PageRequest.class));
    }
}
