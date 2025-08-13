package com.artwork.controller;

import com.artwork.dto.OrderRequestDto;
import com.artwork.dto.OrderDto;
import com.artwork.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequestDto orderRequestDto, @RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        OrderDto order = orderService.placeOrder(orderRequestDto, token);
        Map<String, Object> response = new HashMap<>();
        response.put("data", order);
        response.put("message", "Order placed successfully");
        response.put("success", true);
        return ResponseEntity.status(201).body(response);
    }

    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ARTIST')")
    @GetMapping
    public ResponseEntity<?> getOrders(@RequestHeader("Authorization") String authHeader,
                                      @RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "10") int size,
                                      @RequestParam(defaultValue = "createdAt") String sort,
                                      @RequestParam(defaultValue = "desc") String direction) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        
        // Create pageable object with sorting
        Pageable pageable = PageRequest.of(
            page, 
            size, 
            direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
            sort
        );
        
        Page<OrderDto> orderPage = orderService.getOrdersPaged(token, pageable);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", Map.of(
            "orders", orderPage.getContent(),
            "total", orderPage.getTotalElements(),
            "totalPages", orderPage.getTotalPages(),
            "currentPage", orderPage.getNumber()
        ));
        response.put("message", "Orders retrieved successfully");
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }
    
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ARTIST')")
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable String id, 
                                          @RequestHeader("Authorization") String authHeader) {
        String token = authHeader != null && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
        OrderDto order = orderService.getOrderById(id, token);
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", order);
        response.put("message", "Order retrieved successfully");
        response.put("success", true);
        
        return ResponseEntity.ok(response);
    }
}
