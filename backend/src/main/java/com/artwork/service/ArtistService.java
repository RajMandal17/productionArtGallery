package com.artwork.service;

import com.artwork.dto.UserDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ArtistService {
    Page<UserDto> getAllArtists(String search, Pageable pageable);
    UserDto getArtistById(String id);
    List<UserDto> getFeaturedArtists();
}
