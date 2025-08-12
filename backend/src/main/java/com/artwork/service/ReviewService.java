package com.artwork.service;

import com.artwork.dto.ReviewDto;
import java.util.List;

public interface ReviewService {
    ReviewDto addReview(ReviewDto reviewDto, String token);
    List<ReviewDto> getReviewsByArtworkId(String artworkId);
}
