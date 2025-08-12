package com.artwork.service;

import com.artwork.dto.*;
import org.springframework.data.domain.Page;
import java.util.Map;

public interface AdminService {
    Page<UserDto> getUsers(int page, int limit, String role, String status);
    UserDto updateUserStatus(String userId, String status);
    UserDto updateUserRole(String userId, String role);
    Page<ArtworkDto> getArtworks(int page, int limit, String category, String status);
    ArtworkDto updateArtwork(String artworkId, ArtworkUpdateRequest updateRequest);
    void deleteArtwork(String artworkId);
    Page<OrderDto> getOrders(int page, int limit, String status);
    OrderDto updateOrderStatus(String orderId, String status);
    Map<String, Object> getAnalytics();
}
