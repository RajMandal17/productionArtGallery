package com.artwork.repository;

import com.artwork.entity.Artwork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ArtworkRepository extends JpaRepository<Artwork, String> {
    org.springframework.data.domain.Page<Artwork> findByCategoryIgnoreCase(String category, org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<Artwork> findByArtistId(String artistId, org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<Artwork> findByTitleContainingIgnoreCase(String title, org.springframework.data.domain.Pageable pageable);
    org.springframework.data.domain.Page<Artwork> findByPriceBetween(Double minPrice, Double maxPrice, org.springframework.data.domain.Pageable pageable);
    
    long countByArtistId(String artistId);
    
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r JOIN r.artwork a WHERE a.artistId = :artistId")
    Double getAverageRatingForArtist(String artistId);
}
