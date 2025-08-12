package com.artwork.controller;

import com.artwork.dto.*;
import com.artwork.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(@RequestParam(defaultValue = "1") int page,
                                      @RequestParam(defaultValue = "20") int limit,
                                      @RequestParam(required = false) String role,
                                      @RequestParam(required = false) String status) {
        Page<UserDto> users = adminService.getUsers(page, limit, role, status);
        Map<String, Object> response = new HashMap<>();
        response.put("data", Map.of(
            "users", users.getContent(),
            "total", users.getTotalElements(),
            "totalPages", users.getTotalPages(),
            "currentPage", users.getNumber() + 1
        ));
        response.put("message", "Users retrieved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable String userId, 
                                            @RequestBody Map<String, String> statusUpdate) {
        UserDto user = adminService.updateUserStatus(userId, statusUpdate.get("status"));
        Map<String, Object> response = new HashMap<>();
        response.put("data", user);
        response.put("message", "User status updated successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable String userId, 
                                          @RequestBody Map<String, String> roleUpdate) {
        UserDto user = adminService.updateUserRole(userId, roleUpdate.get("role"));
        Map<String, Object> response = new HashMap<>();
        response.put("data", user);
        response.put("message", "User role updated successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/artworks")
    public ResponseEntity<?> getArtworks(@RequestParam(defaultValue = "1") int page,
                                        @RequestParam(defaultValue = "20") int limit,
                                        @RequestParam(required = false) String category,
                                        @RequestParam(required = false) String status) {
        Page<ArtworkDto> artworks = adminService.getArtworks(page, limit, category, status);
        Map<String, Object> response = new HashMap<>();
        response.put("data", Map.of(
            "artworks", artworks.getContent(),
            "total", artworks.getTotalElements(),
            "totalPages", artworks.getTotalPages(),
            "currentPage", artworks.getNumber() + 1
        ));
        response.put("message", "Artworks retrieved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/artworks/{artworkId}")
    public ResponseEntity<?> updateArtwork(@PathVariable String artworkId,
                                          @RequestBody ArtworkUpdateRequest updateRequest) {
        ArtworkDto artwork = adminService.updateArtwork(artworkId, updateRequest);
        Map<String, Object> response = new HashMap<>();
        response.put("data", artwork);
        response.put("message", "Artwork updated successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/artworks/{artworkId}")
    public ResponseEntity<?> deleteArtwork(@PathVariable String artworkId) {
        adminService.deleteArtwork(artworkId);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Artwork deleted successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(@RequestParam(defaultValue = "1") int page,
                                      @RequestParam(defaultValue = "20") int limit,
                                      @RequestParam(required = false) String status) {
        Page<OrderDto> orders = adminService.getOrders(page, limit, status);
        Map<String, Object> response = new HashMap<>();
        response.put("data", Map.of(
            "orders", orders.getContent(),
            "total", orders.getTotalElements(),
            "totalPages", orders.getTotalPages(),
            "currentPage", orders.getNumber() + 1
        ));
        response.put("message", "Orders retrieved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String orderId,
                                             @RequestBody Map<String, String> statusUpdate) {
        OrderDto order = adminService.updateOrderStatus(orderId, statusUpdate.get("status"));
        Map<String, Object> response = new HashMap<>();
        response.put("data", order);
        response.put("message", "Order status updated successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/analytics")
    public ResponseEntity<?> getAnalytics() {
        Map<String, Object> analytics = adminService.getAnalytics();
        Map<String, Object> response = new HashMap<>();
        response.put("data", analytics);
        response.put("message", "Analytics retrieved successfully");
        response.put("success", true);
        return ResponseEntity.ok(response);
    }
}
