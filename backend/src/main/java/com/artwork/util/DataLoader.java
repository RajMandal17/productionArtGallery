package com.artwork.util;

import com.artwork.entity.Artwork;
import com.artwork.entity.User;
import com.artwork.entity.Role;
import com.artwork.repository.ArtworkRepository;
import com.artwork.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final ArtworkRepository artworkRepository;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Check if we already have data
        if (artworkRepository.count() > 0 && userRepository.count() > 0) {
            System.out.println("Database already has data, not loading sample data");
            return;
        }

        // Create sample users
        createSampleUsers();
        
        // Create sample artworks
        createSampleArtworks();
        
        System.out.println("Sample data loaded successfully");
    }

    private void createSampleUsers() {
        List<User> users = new ArrayList<>();
        
        // Admin user
        User admin = new User();
        admin.setId(UUID.randomUUID().toString());
        admin.setEmail("admin@artwork.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setRole(Role.ADMIN);
        admin.setEnabled(true);
        users.add(admin);
        
        // Artist users
        User artist1 = new User();
        artist1.setId(UUID.randomUUID().toString());
        artist1.setEmail("artist1@artwork.com");
        artist1.setPassword(passwordEncoder.encode("artist123"));
        artist1.setFirstName("Jane");
        artist1.setLastName("Artist");
        artist1.setRole(Role.ARTIST);
        artist1.setEnabled(true);
        users.add(artist1);
        
        User artist2 = new User();
        artist2.setId(UUID.randomUUID().toString());
        artist2.setEmail("artist2@artwork.com");
        artist2.setPassword(passwordEncoder.encode("artist123"));
        artist2.setFirstName("John");
        artist2.setLastName("Painter");
        artist2.setRole(Role.ARTIST);
        artist2.setEnabled(true);
        users.add(artist2);
        
        // Customer users
        User customer = new User();
        customer.setId(UUID.randomUUID().toString());
        customer.setEmail("customer@artwork.com");
        customer.setPassword(passwordEncoder.encode("customer123"));
        customer.setFirstName("Customer");
        customer.setLastName("User");
        customer.setRole(Role.CUSTOMER);
        customer.setEnabled(true);
        users.add(customer);
        
        // Test user for API testing
        User testUser = new User();
        testUser.setId(UUID.randomUUID().toString());
        testUser.setEmail("test@example.com");
        testUser.setPassword(passwordEncoder.encode("password"));
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setRole(Role.CUSTOMER);
        testUser.setEnabled(true);
        users.add(testUser);
        
        userRepository.saveAll(users);
        System.out.println("Created " + users.size() + " sample users");
    }

    private void createSampleArtworks() {
        List<User> artists = userRepository.findByRole(Role.ARTIST);
        if (artists.isEmpty()) {
            System.out.println("No artists found, skipping artwork creation");
            return;
        }
        
        List<Artwork> artworks = new ArrayList<>();
        
        // Categories
        List<String> categories = Arrays.asList(
            "Painting", "Photography", "Sculpture", "Digital Art", 
            "Mixed Media", "Drawing", "Abstract", "Portrait"
        );
        
        // Media
        List<String> media = Arrays.asList(
            "Oil on Canvas", "Acrylic", "Watercolor", "Digital", 
            "Photography", "Bronze", "Marble", "Mixed Media",
            "Charcoal", "Pencil", "Clay", "Wood"
        );
        
        // Create sample artworks for each artist
        for (User artist : artists) {
            for (int i = 0; i < 5; i++) {
                Artwork artwork = new Artwork();
                artwork.setId(UUID.randomUUID().toString());
                artwork.setTitle("Artwork " + (i + 1) + " by " + artist.getFirstName());
                artwork.setDescription("This is a beautiful artwork created by " + artist.getFirstName() + " " + artist.getLastName());
                artwork.setPrice(100.0 + (Math.random() * 900));
                artwork.setCategory(categories.get((int) (Math.random() * categories.size())));
                artwork.setMedium(media.get((int) (Math.random() * media.size())));
                
                // Dimensions
                artwork.setWidth(20.0 + (Math.random() * 50));
                artwork.setHeight(20.0 + (Math.random() * 50));
                if (Math.random() > 0.5) {
                    artwork.setDepth(2.0 + (Math.random() * 10));
                }
                
                // Images - using placeholder URLs
                artwork.setImages(Arrays.asList(
                    "https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg",
                    "https://images.pexels.com/photos/1000366/pexels-photo-1000366.jpeg"
                ));
                
                // Tags
                artwork.setTags(Arrays.asList("art", "creative", artist.getFirstName().toLowerCase(), artwork.getCategory().toLowerCase()));
                
                // Artist - Set the artist relationship directly
                artwork.setArtist(artist);
                
                // Availability
                artwork.setAvailable(Math.random() > 0.2); // 80% available
                
                artworks.add(artwork);
            }
        }
        
        artworkRepository.saveAll(artworks);
        System.out.println("Created " + artworks.size() + " sample artworks");
    }
}
