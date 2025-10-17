package com.artwork.controller;

import com.artwork.dto.ArtworkDto;
import com.artwork.security.UserPrincipal;
import com.artwork.service.ArtworkService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.security.Principal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/artworks")
@RequiredArgsConstructor
public class ArtworkController {
    private final ArtworkService artworkService;

    @GetMapping
    public ResponseEntity<?> getArtworks(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "limit", defaultValue = "12") int limit,
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "minPrice", required = false) Double minPrice,
            @RequestParam(name = "maxPrice", required = false) Double maxPrice,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "artistId", required = false) String artistId
    ) {
        try {
            Page<ArtworkDto> result = artworkService.getArtworks(page, limit, category, minPrice, maxPrice, search, artistId);
            return ResponseEntity.ok(java.util.Map.of(
                "artworks", result.getContent(),
                "total", result.getTotalElements(),
                "totalPages", result.getTotalPages()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }

    // Security handled via SecurityConfig
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createArtwork(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam Double price,
            @RequestParam String category,
            @RequestParam String medium,
            @RequestParam Double width,
            @RequestParam Double height,
            @RequestParam(required = false) Double depth,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            // Log authentication details for debugging
            System.out.println("Create artwork auth - username: " + 
                (userDetails != null ? userDetails.getUsername() : "No user details"));
            System.out.println("User authorities: " + 
                (userDetails != null ? userDetails.getAuthorities() : "N/A"));
            
            // Make sure we have a UserPrincipal
            if (!(userDetails instanceof UserPrincipal)) {
                throw new RuntimeException("User details not of expected type. Found: " + 
                    (userDetails != null ? userDetails.getClass().getName() : "null"));
            }
            
            UserPrincipal principal = (UserPrincipal) userDetails;
            ArtworkDto artwork = artworkService.createArtwork(title, description, price, category, medium, width, height, depth, tags, images, principal.getUser());
            return ResponseEntity.status(201).body(artwork);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    @PreAuthorize("hasAnyAuthority('ROLE_ARTIST', 'ROLE_ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateArtwork(@PathVariable String id, @RequestBody ArtworkDto artworkDto) {
        ArtworkDto updated = artworkService.updateArtwork(id, artworkDto);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * Get artworks for the current authenticated artist
     */
    @PreAuthorize("hasAuthority('ROLE_ARTIST')")
    @GetMapping("/my-artworks")
    public ResponseEntity<?> getMyArtworks(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "limit", defaultValue = "12") int limit,
            @RequestParam(name = "category", required = false) String category,
             @RequestParam(name = "minPrice", required = false, defaultValue = "0") Double minPrice,
            @RequestParam(name = "maxPrice", required = false) Double maxPrice,
            @RequestParam(name = "search", required = false) String search,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        try {
            // Get the artist ID from the authenticated principal
            String artistId = ((UserPrincipal) userDetails).getUser().getId();
            System.out.println("Artist ID from Principal: " + artistId);
            
            Page<ArtworkDto> result = artworkService.getArtworks(page, limit, category, minPrice, maxPrice, search, artistId);
            
            // Ensure we always return a valid array, even if empty
            List<ArtworkDto> artworks = result != null ? result.getContent() : new ArrayList<>();
            long total = result != null ? result.getTotalElements() : 0;
            int totalPages = result != null ? result.getTotalPages() : 0;
            
            return ResponseEntity.ok(Map.of(
                "artworks", artworks,
                "total", total,
                "totalPages", totalPages
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", e.getMessage(),
                "status", "Error retrieving artist artworks",
                "artworks", new ArrayList<>(),  // Always provide empty array on error
                "total", 0,
                "totalPages", 0
            ));
        }
    }
    
    /**
     * Get artworks by specific artist ID
     */
    @GetMapping("/artist/{artistId}")
    public ResponseEntity<?> getArtworksByArtist(@PathVariable String artistId) {
        try {
            System.out.println("=== Getting artworks for artist: " + artistId + " ===");
            
            // Use the existing getArtworks method with artistId as parameter
            Page<ArtworkDto> result = artworkService.getArtworks(1, 100, null, null, null, null, artistId);
            
            System.out.println("Service returned: " + (result != null ? "Valid Page object" : "NULL"));
            if (result != null) {
                System.out.println("Total elements: " + result.getTotalElements());
                System.out.println("Content size: " + (result.getContent() != null ? result.getContent().size() : "NULL"));
            }
            
            // Ensure we always return a valid array, even if empty
            List<ArtworkDto> artworks = result != null && result.getContent() != null ? result.getContent() : new ArrayList<>();
            long total = result != null ? result.getTotalElements() : 0;
            int totalPages = result != null ? result.getTotalPages() : 0;
            
            Map<String, Object> response = Map.of(
                "artworks", artworks,
                "total", total,
                "totalPages", totalPages
            );
            
            System.out.println("Final response structure: artworks array size = " + artworks.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("ERROR in getArtworksByArtist: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", e.getMessage(),
                "status", "Error retrieving artist artworks",
                "artworks", new ArrayList<>(),  // Always provide empty array on error
                "total", 0,
                "totalPages", 0
            ));
        }
    }
    
    /**
     * Debug endpoint for artwork authentication
     */
    @GetMapping("/debug-auth")
    public ResponseEntity<?> debugAuth(Authentication authentication) {
        Map<String, Object> debug = new HashMap<>();
        
        if (authentication != null) {
            debug.put("isAuthenticated", authentication.isAuthenticated());
            debug.put("principal", authentication.getPrincipal().toString());
            debug.put("name", authentication.getName());
            debug.put("authorities", authentication.getAuthorities().toString());
            
            if (authentication.getPrincipal() instanceof UserPrincipal) {
                UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
                debug.put("userId", principal.getUser().getId());
                debug.put("userEmail", principal.getUser().getEmail());
                debug.put("userRole", principal.getUser().getRole().toString());
            }
        } else {
            debug.put("error", "No authentication object found");
        }
        
        return ResponseEntity.ok(debug);
    }
}
