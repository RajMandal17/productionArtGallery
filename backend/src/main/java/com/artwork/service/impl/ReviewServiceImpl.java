package com.artwork.service.impl;

import com.artwork.dto.ReviewDto;
import com.artwork.entity.Review;
import com.artwork.repository.ReviewRepository;
import com.artwork.security.JwtUtil;
import com.artwork.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;
    private final ModelMapper modelMapper;
    private final JwtUtil jwtUtil;

    @Override
    public ReviewDto addReview(ReviewDto reviewDto, String token) {
        String userId = jwtUtil.getClaims(token).getSubject();
        Review review = Review.builder()
                .customerId(userId)
                .artworkId(reviewDto.getArtworkId())
                .rating(reviewDto.getRating())
                .comment(reviewDto.getComment())
                .build();
        reviewRepository.save(review);
        return modelMapper.map(review, ReviewDto.class);
    }

    @Override
    public List<ReviewDto> getReviewsByArtworkId(String artworkId) {
        List<Review> reviews = reviewRepository.findByArtworkIdOrderByCreatedAtDesc(artworkId);
        return reviews.stream()
                .map(review -> modelMapper.map(review, ReviewDto.class))
                .collect(Collectors.toList());
    }
}
