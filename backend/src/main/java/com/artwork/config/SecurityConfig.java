package com.artwork.config;

import com.artwork.security.JwtAuthenticationFilter;
import com.artwork.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService userDetailsService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final com.artwork.config.RateLimitFilter rateLimitFilter;
    
    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.Arrays.asList(
            "https://artworkgallery-dev.up.railway.app",
            "http://localhost:3000", 
            "http://localhost:5173"
        ));
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(java.util.Arrays.asList("Authorization", "Cache-Control", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(java.util.Arrays.asList("Authorization"));
        configuration.setMaxAge(3600L);
        
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                // Disable CSRF for authentication endpoints and public API
                .ignoringRequestMatchers(
                    "/api/auth/**", 
                    "/api/artworks", 
                    "/api/artists/**", 
                    "/api/health/**", 
                    "/health",
                    "/api/v1/artwork-query/**" // CQRS read-only endpoints are safe from CSRF
                )
                // Enable CSRF for sensitive operations (user profile updates, payments, etc.)
                .csrfTokenRepository(new org.springframework.security.web.csrf.CookieCsrfTokenRepository())
            )
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/", "/api/auth/login", "/api/auth/register", "/swagger-ui.html", "/swagger-ui/**", "/api-docs/**").permitAll()
                .requestMatchers("/api/health", "/health").permitAll() // Allow Railway health checks
                .requestMatchers("/uploads/**").permitAll() // Allow public access to uploaded images
                .requestMatchers("/api/artworks").permitAll() // Allow public access to list artworks
                .requestMatchers("/api/artworks/{id:[\\w-]+}").permitAll() // Public access to view single artwork
                .requestMatchers("/api/artists/**").permitAll() // Public access to artists
                // CQRS query endpoints (read-only, public access)
                .requestMatchers("/api/v1/artwork-query/**").permitAll() // Public access to all query endpoints
                
                // Auth verification endpoint - requires authentication but doesn't check role
                .requestMatchers("/api/auth/verify").authenticated()
                
                // Debug endpoint for troubleshooting authentication issues
                .requestMatchers("/api/debug/**").authenticated()
                
                // Role-specific endpoints
                .requestMatchers("/api/artworks/my-artworks").hasAuthority("ROLE_ARTIST") // Only artists can access their own artworks
                .requestMatchers("/api/orders/**").hasAnyAuthority("ROLE_CUSTOMER", "ROLE_ARTIST") // Allow both customers and artists to access orders
                .requestMatchers("/api/cart/**").hasAuthority("ROLE_CUSTOMER") // Cart access for customers only
                .requestMatchers("/api/wishlist/**").hasAuthority("ROLE_CUSTOMER") // Wishlist access for customers only
                .requestMatchers("/api/users/**").authenticated() // User profile access requires authentication
                .requestMatchers("/api/dashboard/artist/**").hasAuthority("ROLE_ARTIST") // Artist dashboard access
                .requestMatchers("/api/dashboard/admin/**").hasAuthority("ROLE_ADMIN") // Admin dashboard access
                .requestMatchers("/api/dashboard/customer/**").hasAuthority("ROLE_CUSTOMER") // Customer dashboard access
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/artworks").hasAnyAuthority("ROLE_ARTIST", "ROLE_ADMIN") // Create artwork
                
                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(rateLimitFilter, JwtAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
