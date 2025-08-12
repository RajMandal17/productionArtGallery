package com.artwork.service.impl;

import com.artwork.dto.ArtworkDto;
import com.artwork.entity.Artwork;
import com.artwork.entity.User;
import com.artwork.repository.ArtworkRepository;
import com.artwork.repository.UserRepository;
import com.artwork.security.UserPrincipal;
import com.artwork.service.ArtworkService;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;
import java.util.ArrayList;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.io.IOException;

@Service
@RequiredArgsConstructor
public class ArtworkServiceImpl implements ArtworkService {
    private final ArtworkRepository artworkRepository;
    private final ModelMapper modelMapper;
    
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Override
    public Page<ArtworkDto> getArtworks(int page, int limit, String category, Double minPrice, Double maxPrice, String search, String artistId) {
        // Basic implementation: filtering by category, price, search, artistId
        PageRequest pageable = PageRequest.of(page - 1, limit);
        Page<Artwork> artworks;

        if (category != null && !category.isEmpty()) {
            artworks = artworkRepository.findByCategoryIgnoreCase(category, pageable);
        } else if (artistId != null && !artistId.isEmpty()) {
            artworks = artworkRepository.findByArtistId(artistId, pageable);
        } else if (search != null && !search.isEmpty()) {
            artworks = artworkRepository.findByTitleContainingIgnoreCase(search, pageable);
        } else if (minPrice != null && maxPrice != null) {
            artworks = artworkRepository.findByPriceBetween(minPrice, maxPrice, pageable);
        } else {
           System.out.println("Fetching artworks...");
           artworks = artworkRepository.findAll(pageable);
           System.out.println("Found artworks: " + artworks.getTotalElements());
        }
        return artworks.map(artwork -> modelMapper.map(artwork, ArtworkDto.class));
    }

    @Override
    public ArtworkDto createArtwork(String title, String description, Double price, String category, String medium, Double width, Double height, Double depth, List<String> tags, List<MultipartFile> images, com.artwork.entity.User artist) {
        
        if (artist == null) {
            throw new RuntimeException("Artist cannot be null when creating artwork");
        }
        
        System.out.println("Creating artwork for artist: " + artist.getEmail() + " (ID: " + artist.getId() + ")");
        
        // Handle image upload and save
        List<String> imageUrls = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            imageUrls = saveArtworkImages(images);
        }
        
        Artwork artwork = Artwork.builder()
                .title(title)
                .description(description)
                .price(price)
                .category(category)
                .medium(medium)
                .width(width)
                .height(height)
                .depth(depth)
                .tags(tags)
                .images(imageUrls)
                .isAvailable(true)
                .artist(artist) // Set the artist directly
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
                
        artworkRepository.save(artwork);
        return modelMapper.map(artwork, ArtworkDto.class);
    }

    @Override
    public ArtworkDto updateArtwork(String id, ArtworkDto artworkDto) {
        Artwork artwork = artworkRepository.findById(id).orElseThrow();
        modelMapper.map(artworkDto, artwork);
        artworkRepository.save(artwork);
        return modelMapper.map(artwork, ArtworkDto.class);
    }
    
    private List<String> saveArtworkImages(List<MultipartFile> images) {
        List<String> imageUrls = new ArrayList<>();
        
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, "artworks");
            System.out.println("Upload directory path: " + uploadPath.toAbsolutePath());
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("Created upload directory: " + uploadPath.toAbsolutePath());
            }
            
            for (MultipartFile image : images) {
                if (!image.isEmpty()) {
                    // Generate unique filename
                    String originalFilename = image.getOriginalFilename();
                    String fileExtension = originalFilename != null && originalFilename.contains(".") 
                        ? originalFilename.substring(originalFilename.lastIndexOf("."))
                        : ".jpg";
                    String filename = UUID.randomUUID().toString() + fileExtension;
                    
                    // Save file
                    Path filePath = uploadPath.resolve(filename);
                    System.out.println("Saving file to: " + filePath.toAbsolutePath());
                    Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                    System.out.println("File saved successfully: " + filePath.toAbsolutePath());
                    
                    // Store relative URL (this should be served as static content)
                    String imageUrl = "/uploads/artworks/" + filename;
                    imageUrls.add(imageUrl);
                    System.out.println("Added image URL: " + imageUrl);
                }
            }
        } catch (IOException e) {
            System.err.println("Failed to save artwork images: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to save artwork images", e);
        }
        
        return imageUrls;
    }
}
