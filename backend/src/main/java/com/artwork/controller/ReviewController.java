package com.artwork.controller;

import com.artwork.dto.ReviewDto;
import com.artwork.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody ReviewDto reviewDto, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        ReviewDto review = reviewService.addReview(reviewDto, token);
        return ResponseEntity.status(201).body(review);
    }
    
    @GetMapping("/artwork/{artworkId}")
    public ResponseEntity<?> getReviewsByArtwork(@PathVariable String artworkId) {
        try {
            System.out.println("Getting reviews for artwork: " + artworkId);
            var reviews = reviewService.getReviewsByArtworkId(artworkId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", e.getMessage(),
                "status", "Error retrieving artwork reviews"
            ));
        }
    }
    
    @PreAuthorize("hasAuthority('ROLE_ARTIST')")
    @GetMapping("/artist/{artistId}")
    public ResponseEntity<?> getReviewsByArtist(@PathVariable String artistId) {
        try {
            System.out.println("Getting all reviews for artist: " + artistId);
            var reviews = reviewService.getReviewsByArtistId(artistId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", e.getMessage(),
                "status", "Error retrieving artist reviews",
                "reviews", new java.util.ArrayList<>()  // Always return empty array on error
            ));
        }
    }
}
