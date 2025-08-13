package com.artwork.controller;

import com.artwork.dto.ArtworkDto;
import com.artwork.service.ArtworkQueryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArtworkQueryControllerTest {

    @Mock
    private ArtworkQueryService artworkQueryService;

    @InjectMocks
    private ArtworkQueryController artworkQueryController;

    private ArtworkDto artworkDto1;
    private ArtworkDto artworkDto2;
    private List<ArtworkDto> artworkDtos;
    private Page<ArtworkDto> artworkPage;

    @BeforeEach
    void setUp() {
        artworkDto1 = new ArtworkDto();
        artworkDto1.setId("art-1");
        artworkDto1.setTitle("Sunset Landscape");
        artworkDto1.setCategory("Painting");
        artworkDto1.setPrice(1000.0);
        artworkDto1.setArtistId("artist-1");

        artworkDto2 = new ArtworkDto();
        artworkDto2.setId("art-2");
        artworkDto2.setTitle("Abstract Form");
        artworkDto2.setCategory("Sculpture");
        artworkDto2.setPrice(2000.0);
        artworkDto2.setArtistId("artist-2");

        artworkDtos = Arrays.asList(artworkDto1, artworkDto2);
        artworkPage = new PageImpl<>(artworkDtos, PageRequest.of(0, 10), artworkDtos.size());
    }

    @Test
    @DisplayName("Should get paginated artworks")
    void getArtworks() {
        // Arrange
        int page = 0;
        int limit = 10;
        when(artworkQueryService.getArtworks(page, limit, null, null, null, null, null))
                .thenReturn(artworkPage);

        // Act
        ResponseEntity<Map<String, Object>> response = artworkQueryController.getArtworks(page, limit, null, null, null, null, null);

        // Assert
        Map<String, Object> responseBody = response.getBody();
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(artworkDtos, responseBody.get("artworks"));
        assertEquals(0, responseBody.get("currentPage"));
        assertEquals(2L, responseBody.get("totalItems"));
        assertEquals(1, responseBody.get("totalPages"));
        
        verify(artworkQueryService).getArtworks(page, limit, null, null, null, null, null);
    }

    @Test
    @DisplayName("Should get artwork by ID")
    void getArtwork() {
        // Arrange
        String artworkId = "art-1";
        when(artworkQueryService.getArtworkById(artworkId)).thenReturn(artworkDto1);

        // Act
        ResponseEntity<ArtworkDto> response = artworkQueryController.getArtwork(artworkId);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(artworkDto1, response.getBody());
        
        verify(artworkQueryService).getArtworkById(artworkId);
    }

    @Test
    @DisplayName("Should get featured artworks")
    void getFeaturedArtworks() {
        // Arrange
        when(artworkQueryService.getFeaturedArtworks()).thenReturn(artworkDtos);

        // Act
        ResponseEntity<List<ArtworkDto>> response = artworkQueryController.getFeaturedArtworks();

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(artworkDtos, response.getBody());
        assertEquals(2, response.getBody().size());
        
        verify(artworkQueryService).getFeaturedArtworks();
    }

    @Test
    @DisplayName("Should get artworks by artist")
    void getArtworksByArtist() {
        // Arrange
        String artistId = "artist-1";
        List<ArtworkDto> artistArtworks = Arrays.asList(artworkDto1);
        when(artworkQueryService.getArtworksByArtistId(artistId)).thenReturn(artistArtworks);

        // Act
        ResponseEntity<List<ArtworkDto>> response = artworkQueryController.getArtworksByArtist(artistId);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(artistArtworks, response.getBody());
        assertEquals(1, response.getBody().size());
        
        verify(artworkQueryService).getArtworksByArtistId(artistId);
    }

    @Test
    @DisplayName("Should get related artworks")
    void getRelatedArtworks() {
        // Arrange
        String artworkId = "art-1";
        int limit = 4;
        List<ArtworkDto> relatedArtworks = Arrays.asList(artworkDto2);
        when(artworkQueryService.getRelatedArtworks(artworkId, limit)).thenReturn(relatedArtworks);

        // Act
        ResponseEntity<List<ArtworkDto>> response = artworkQueryController.getRelatedArtworks(artworkId, limit);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(relatedArtworks, response.getBody());
        assertEquals(1, response.getBody().size());
        
        verify(artworkQueryService).getRelatedArtworks(artworkId, limit);
    }
}
