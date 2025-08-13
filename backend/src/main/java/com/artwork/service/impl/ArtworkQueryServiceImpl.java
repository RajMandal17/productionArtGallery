package com.artwork.service.impl;

import com.artwork.dto.ArtworkDto;
import com.artwork.entity.Artwork;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.ArtworkRepository;
import com.artwork.service.ArtworkQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ArtworkQueryService using CQRS pattern
 * This service is responsible for read operations only
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ArtworkQueryServiceImpl implements ArtworkQueryService {

    private final ArtworkRepository artworkRepository;
    private final ModelMapper modelMapper;

    @Override
    @Cacheable(value = "artworksCache", key = "'artworks_' + #page + '_' + #limit + '_' + #category + '_' + #minPrice + '_' + #maxPrice + '_' + #search + '_' + #artistId")
    public Page<ArtworkDto> getArtworks(int page, int limit, String category, Double minPrice, Double maxPrice, String search, String artistId) {
        log.info("Fetching artworks with filters - page: {}, limit: {}, category: {}, price range: {}-{}, search: {}, artistId: {}", 
                page, limit, category, minPrice, maxPrice, search, artistId);
        
        Pageable pageable = PageRequest.of(page, limit, Sort.by("createdAt").descending());
        Page<Artwork> artworks;
        
        // Apply different filters based on parameters provided
        if (category != null && !category.isEmpty() && search != null && !search.isEmpty()) {
            artworks = artworkRepository.findByCategoryAndTitleContainingIgnoreCase(category, search, pageable);
        } else if (category != null && !category.isEmpty()) {
            artworks = artworkRepository.findByCategory(category, pageable);
        } else if (search != null && !search.isEmpty()) {
            artworks = artworkRepository.findByTitleContainingIgnoreCase(search, pageable);
        } else if (minPrice != null && maxPrice != null) {
            artworks = artworkRepository.findByPriceBetween(minPrice, maxPrice, pageable);
        } else if (artistId != null && !artistId.isEmpty()) {
            artworks = artworkRepository.findByArtistId(artistId, pageable);
        } else {
            artworks = artworkRepository.findAll(pageable);
        }
        
        return artworks.map(this::convertToDto);
    }

    @Override
    @Cacheable(value = "artworkCache", key = "#id")
    public ArtworkDto getArtworkById(String id) {
        log.info("Fetching artwork with id: {}", id);
        Artwork artwork = artworkRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artwork not found with id: " + id));
        return convertToDto(artwork);
    }

    @Override
    @Cacheable(value = "featuredArtworksCache")
    public List<ArtworkDto> getFeaturedArtworks() {
        log.info("Fetching featured artworks");
        List<Artwork> featuredArtworks = artworkRepository.findByFeaturedTrue(
                PageRequest.of(0, 8, Sort.by("createdAt").descending()));
        return featuredArtworks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "artistArtworksCache", key = "#artistId")
    public List<ArtworkDto> getArtworksByArtistId(String artistId) {
        log.info("Fetching artworks for artist: {}", artistId);
        List<Artwork> artworks = artworkRepository.findByArtistId(artistId);
        return artworks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Cacheable(value = "relatedArtworksCache", key = "#artworkId + '_' + #limit")
    public List<ArtworkDto> getRelatedArtworks(String artworkId, int limit) {
        log.info("Fetching related artworks for artwork: {}", artworkId);
        
        // First get the artwork to find its category
        Artwork artwork = artworkRepository.findById(artworkId)
                .orElseThrow(() -> new ResourceNotFoundException("Artwork not found with id: " + artworkId));
        
        // Then find artworks in the same category, excluding the original artwork
        List<Artwork> relatedArtworks = artworkRepository.findByCategoryAndIdNot(
                artwork.getCategory(), artworkId, PageRequest.of(0, limit));
        
        return relatedArtworks.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private ArtworkDto convertToDto(Artwork artwork) {
        return modelMapper.map(artwork, ArtworkDto.class);
    }
}
