package com.artwork.service.impl;

import com.artwork.dto.ArtworkDto;
import com.artwork.entity.Artwork;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.ArtworkRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ArtworkQueryServiceImplTest {

    @Mock
    private ArtworkRepository artworkRepository;

    @Mock
    private ModelMapper modelMapper;

    @InjectMocks
    private ArtworkQueryServiceImpl artworkQueryService;

    private Artwork artwork1;
    private Artwork artwork2;
    private ArtworkDto artworkDto1;
    private ArtworkDto artworkDto2;

    @BeforeEach
    void setUp() {
        artwork1 = new Artwork();
        artwork1.setId("art-1");
        artwork1.setTitle("Sunset Landscape");
        artwork1.setCategory("Painting");
        artwork1.setPrice(1000.0);
        artwork1.setArtistId("artist-1");
        artwork1.setFeatured(true);

        artwork2 = new Artwork();
        artwork2.setId("art-2");
        artwork2.setTitle("Abstract Form");
        artwork2.setCategory("Sculpture");
        artwork2.setPrice(2000.0);
        artwork2.setArtistId("artist-2");
        artwork2.setFeatured(false);

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

        // Configure modelMapper to return the DTOs when mapping
        when(modelMapper.map(eq(artwork1), eq(ArtworkDto.class))).thenReturn(artworkDto1);
        when(modelMapper.map(eq(artwork2), eq(ArtworkDto.class))).thenReturn(artworkDto2);
    }

    @Test
    @DisplayName("Should return paginated artworks without filters")
    void getArtworksWithoutFilters() {
        // Arrange
        int page = 0;
        int limit = 10;
        Pageable pageable = PageRequest.of(page, limit);
        List<Artwork> artworkList = Arrays.asList(artwork1, artwork2);
        Page<Artwork> artworkPage = new PageImpl<>(artworkList, pageable, artworkList.size());
        
        when(artworkRepository.findAll(any(Pageable.class))).thenReturn(artworkPage);

        // Act
        Page<ArtworkDto> result = artworkQueryService.getArtworks(page, limit, null, null, null, null, null);

        // Assert
        assertEquals(2, result.getTotalElements());
        assertEquals(2, result.getContent().size());
        assertEquals("Sunset Landscape", result.getContent().get(0).getTitle());
        assertEquals("Abstract Form", result.getContent().get(1).getTitle());
    }

    @Test
    @DisplayName("Should return paginated artworks with category filter")
    void getArtworksWithCategoryFilter() {
        // Arrange
        int page = 0;
        int limit = 10;
        String category = "Painting";
        Pageable pageable = PageRequest.of(page, limit);
        List<Artwork> artworkList = Arrays.asList(artwork1);
        Page<Artwork> artworkPage = new PageImpl<>(artworkList, pageable, artworkList.size());
        
        when(artworkRepository.findByCategory(eq(category), any(Pageable.class))).thenReturn(artworkPage);

        // Act
        Page<ArtworkDto> result = artworkQueryService.getArtworks(page, limit, category, null, null, null, null);

        // Assert
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        assertEquals("Sunset Landscape", result.getContent().get(0).getTitle());
    }

    @Test
    @DisplayName("Should get artwork by ID")
    void getArtworkById() {
        // Arrange
        String artworkId = "art-1";
        when(artworkRepository.findById(artworkId)).thenReturn(Optional.of(artwork1));

        // Act
        ArtworkDto result = artworkQueryService.getArtworkById(artworkId);

        // Assert
        assertEquals("Sunset Landscape", result.getTitle());
        assertEquals("Painting", result.getCategory());
    }

    @Test
    @DisplayName("Should throw exception when artwork not found")
    void getArtworkByIdNotFound() {
        // Arrange
        String artworkId = "non-existent";
        when(artworkRepository.findById(artworkId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, 
                     () -> artworkQueryService.getArtworkById(artworkId));
    }

    @Test
    @DisplayName("Should get featured artworks")
    void getFeaturedArtworks() {
        // Arrange
        List<Artwork> featuredArtworks = Arrays.asList(artwork1);
        when(artworkRepository.findByFeaturedTrue(any(Pageable.class))).thenReturn(featuredArtworks);

        // Act
        List<ArtworkDto> result = artworkQueryService.getFeaturedArtworks();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Sunset Landscape", result.get(0).getTitle());
    }

    @Test
    @DisplayName("Should get artworks by artist ID")
    void getArtworksByArtistId() {
        // Arrange
        String artistId = "artist-1";
        List<Artwork> artistArtworks = Arrays.asList(artwork1);
        when(artworkRepository.findByArtistId(artistId)).thenReturn(artistArtworks);

        // Act
        List<ArtworkDto> result = artworkQueryService.getArtworksByArtistId(artistId);

        // Assert
        assertEquals(1, result.size());
        assertEquals("Sunset Landscape", result.get(0).getTitle());
    }

    @Test
    @DisplayName("Should get related artworks")
    void getRelatedArtworks() {
        // Arrange
        String artworkId = "art-1";
        int limit = 4;
        
        when(artworkRepository.findById(artworkId)).thenReturn(Optional.of(artwork1));
        
        List<Artwork> relatedArtworks = Arrays.asList(artwork2);
        when(artworkRepository.findByCategoryAndIdNot(eq(artwork1.getCategory()), eq(artworkId), any(Pageable.class)))
            .thenReturn(relatedArtworks);

        // Act
        List<ArtworkDto> result = artworkQueryService.getRelatedArtworks(artworkId, limit);

        // Assert
        assertEquals(1, result.size());
        assertEquals("Abstract Form", result.get(0).getTitle());
    }
}
