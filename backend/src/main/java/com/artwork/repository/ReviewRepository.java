package com.artwork.repository;

import com.artwork.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    List<Review> findByArtworkIdOrderByCreatedAtDesc(String artworkId);
    
    @org.springframework.data.jpa.repository.Query("SELECT r FROM Review r JOIN Artwork a ON r.artworkId = a.id WHERE a.artist.id = ?1 ORDER BY r.createdAt DESC")
    List<Review> findByArtistIdOrderByCreatedAtDesc(String artistId);
}
