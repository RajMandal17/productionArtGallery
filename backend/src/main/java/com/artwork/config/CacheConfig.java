package com.artwork.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext.SerializationPair;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Value("${spring.cache.redis.time-to-live:3600}")
    private long timeToLiveSeconds;

    @Bean
    @ConditionalOnProperty(name = "spring.redis.host")
    public RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofSeconds(timeToLiveSeconds))
                .disableCachingNullValues()
                .serializeValuesWith(SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }

    @Bean
    @ConditionalOnProperty(name = "spring.redis.host")
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        return (builder) -> builder
                // Artworks listing (shorter TTL since it changes frequently with filters)
                .withCacheConfiguration("artworks",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(10)))
                // Individual artwork (medium TTL as it doesn't change often)
                .withCacheConfiguration("artwork",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(30)))
                // Artists listing
                .withCacheConfiguration("artists",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(60)))
                // Featured artists (longer TTL as it's curated content)
                .withCacheConfiguration("featuredArtists",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(6)))
                // Featured artworks (curated content)
                .withCacheConfiguration("featuredArtworks",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(4)))
                // User profile data (medium TTL)
                .withCacheConfiguration("users",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofMinutes(30)))
                // Categories (long TTL as they rarely change)
                .withCacheConfiguration("categories",
                        RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(24)));
    }

    /**
     * Fallback cache manager when Redis is not available
     * Uses in-memory caching as graceful degradation
     */
    @Bean
    @Primary
    @ConditionalOnProperty(name = "spring.redis.host", matchIfMissing = true, havingValue = "")
    public CacheManager fallbackCacheManager() {
        return new ConcurrentMapCacheManager(
            "artworks", "artwork", "artists", "featuredArtists", 
            "featuredArtworks", "users", "categories",
            "artworksCache", "artworkCache", "featuredArtworksCache"
        );
    }
}
