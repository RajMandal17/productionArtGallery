package com.artwork.entity;

import com.artwork.dto.Dimensions;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "artworks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Artwork {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String title;
    private String description;
    private Double price;
    private String category;
    private String medium;
    private Double width;
    private Double height;
    private Double depth;

    @ElementCollection
    private List<String> images;

    @ElementCollection
    private List<String> tags;

    @Builder.Default
    private Boolean isAvailable = true;
    
    @Builder.Default
    private Boolean featured = false;

    // We need both artistId for direct queries and artist relationship
    @Column(name = "artist_id", insertable = false, updatable = false)
    private String artistId;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "artist_id", nullable = false)
    private User artist;

    @OneToMany(mappedBy = "artwork")
    private List<Review> reviews;

    @OneToMany(mappedBy = "artwork")
    private List<CartItem> cartItems;

    @OneToMany(mappedBy = "artwork")
    private List<WishlistItem> wishlistItems;

    @OneToMany(mappedBy = "artwork")
    private List<OrderItem> orderItems;

    // Helper methods
    public Dimensions getDimensions() {
        return Dimensions.builder()
                .width(this.width)
                .height(this.height)
                .depth(this.depth)
                .build();
    }
    
    public void setDimensions(Dimensions dimensions) {
        if (dimensions != null) {
            this.width = dimensions.getWidth();
            this.height = dimensions.getHeight();
            this.depth = dimensions.getDepth();
        }
    }
    
    public void setAvailable(boolean available) {
        this.isAvailable = available;
    }
}
