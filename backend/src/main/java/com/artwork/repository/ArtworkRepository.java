package com.artwork.repository;

import com.artwork.entity.Artwork;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtworkRepository extends JpaRepository<Artwork, String> {
    // Basic query methods
    Page<Artwork> findByCategory(String category, Pageable pageable);
    Page<Artwork> findByArtistId(String artistId, Pageable pageable);
    Page<Artwork> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    Page<Artwork> findByPriceBetween(Double minPrice, Double maxPrice, Pageable pageable);
    
    // Combined query methods for filtering
    Page<Artwork> findByCategoryAndTitleContainingIgnoreCase(String category, String title, Pageable pageable);
    
    // List query methods (non-paginated)
    List<Artwork> findByArtistId(String artistId);
    List<Artwork> findByFeaturedTrue(Pageable pageable);
    List<Artwork> findByCategoryAndIdNot(String category, String artworkId, Pageable pageable);
    
    // Analytical queries
    long countByArtistId(String artistId);
    
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r JOIN r.artwork a WHERE a.artistId = :artistId")
    Double getAverageRatingForArtist(String artistId);
}
