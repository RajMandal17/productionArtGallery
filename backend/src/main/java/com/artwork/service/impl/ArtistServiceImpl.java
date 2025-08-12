package com.artwork.service.impl;

import com.artwork.dto.UserDto;
import com.artwork.entity.Role;
import com.artwork.entity.User;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.ArtworkRepository;
import com.artwork.repository.UserRepository;
import com.artwork.service.ArtistService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import java.util.Map;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArtistServiceImpl implements ArtistService {

    private final UserRepository userRepository;
    private final ArtworkRepository artworkRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<UserDto> getAllArtists(String search, Pageable pageable) {
        Page<User> artists;
        
        if (search != null && !search.trim().isEmpty()) {
            artists = userRepository.findByRoleAndNameContaining(Role.ARTIST, search.toLowerCase(), pageable);
        } else {
            artists = userRepository.findByRole(Role.ARTIST, pageable);
        }
        
        return artists.map(artist -> mapToArtistDto(artist));
    }

    @Override
    public UserDto getArtistById(String id) {
        User artist = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Artist not found with ID: " + id));
                
        if (artist.getRole() != Role.ARTIST) {
            throw new ResourceNotFoundException("User is not an artist");
        }
                
        return mapToArtistDto(artist);
    }

    @Override
    public List<UserDto> getFeaturedArtists() {
        // For demo purposes, get 5 random artists
        // In a real app, this could be based on various metrics like number of sales, ratings, etc.
        List<User> featuredArtists = userRepository.findByRole(Role.ARTIST)
                .stream()
                .limit(5)
                .collect(Collectors.toList());
                
        return featuredArtists.stream()
                .map(this::mapToArtistDto)
                .collect(Collectors.toList());
    }
    
    private UserDto mapToArtistDto(User artist) {
        UserDto dto = modelMapper.map(artist, UserDto.class);
        
        // Count the number of artworks for this artist
        long artworkCount = artworkRepository.countByArtistId(artist.getId());
        dto.setArtworkCount(artworkCount);
        dto.setAverageRating(getArtistAverageRating(artist.getId()));
        
        return dto;
    }
    
    private double getArtistAverageRating(String artistId) {
        Double averageRating = artworkRepository.getAverageRatingForArtist(artistId);
        return averageRating != null ? averageRating : 0.0;
    }
}
