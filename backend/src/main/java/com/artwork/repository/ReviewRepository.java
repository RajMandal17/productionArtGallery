package com.artwork.repository;

import com.artwork.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByArtworkIdOrderByCreatedAtDesc(String artworkId);
}
