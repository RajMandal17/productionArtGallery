package com.artwork.service.impl;

import com.artwork.dto.*;
import com.artwork.entity.*;
import com.artwork.exception.ResourceNotFoundException;
import com.artwork.repository.*;
import com.artwork.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final UserRepository userRepository;
    private final ArtistRepository artistRepository;
    private final ArtworkRepository artworkRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ModelMapper modelMapper;

    @Override
    public Page<UserDto> getUsers(int page, int limit, String role, String status) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        
        if (role != null || status != null) {
            List<User> allUsers = userRepository.findAll();
            List<User> filteredUsers = allUsers.stream()
                .filter(user -> role == null || user.getRole().name().equalsIgnoreCase(role))
                .filter(user -> status == null || 
                               (user.getStatus() != null && user.getStatus().name().equalsIgnoreCase(status)))
                .collect(Collectors.toList());
            
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), filteredUsers.size());
            
            List<User> pageUsers = start < end ? filteredUsers.subList(start, end) : Collections.emptyList();
            Page<User> userPage = new PageImpl<>(pageUsers, pageable, filteredUsers.size());
            return userPage.map(user -> modelMapper.map(user, UserDto.class));
        } else {
            Page<User> users = userRepository.findAll(pageable);
            return users.map(user -> modelMapper.map(user, UserDto.class));
        }
    }

    @Override
    @Transactional
    public UserDto updateUserStatus(String userId, String status) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        try {
            UserStatus userStatus = UserStatus.valueOf(status.toUpperCase());
            user.setStatus(userStatus);
            userRepository.save(user);
            
            return modelMapper.map(user, UserDto.class);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid user status: " + status);
        }
    }

    @Override
    @Transactional
    public UserDto updateUserRole(String userId, String role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        try {
            Role userRole = Role.valueOf(role.toUpperCase());
            user.setRole(userRole);
            userRepository.save(user);
            
            return modelMapper.map(user, UserDto.class);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid user role: " + role);
        }
    }

    @Override
    public Page<ArtworkDto> getArtworks(int page, int limit, String category, String status) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        
        if (category != null || status != null) {
            List<Artwork> allArtworks = artworkRepository.findAll();
            List<Artwork> filteredArtworks = allArtworks.stream()
                .filter(artwork -> category == null || artwork.getCategory().equalsIgnoreCase(category))
                .filter(artwork -> status == null || 
                                 (status.equalsIgnoreCase("available") && artwork.getIsAvailable()) ||
                                 (status.equalsIgnoreCase("unavailable") && !artwork.getIsAvailable()))
                .collect(Collectors.toList());
            
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), filteredArtworks.size());
            
            List<Artwork> pageArtworks = start < end ? filteredArtworks.subList(start, end) : Collections.emptyList();
            Page<Artwork> artworkPage = new PageImpl<>(pageArtworks, pageable, filteredArtworks.size());
            return artworkPage.map(artwork -> modelMapper.map(artwork, ArtworkDto.class));
        } else {
            Page<Artwork> artworks = artworkRepository.findAll(pageable);
            return artworks.map(artwork -> modelMapper.map(artwork, ArtworkDto.class));
        }
    }

    @Override
    @Transactional
    public ArtworkDto updateArtwork(String artworkId, ArtworkUpdateRequest updateRequest) {
        Artwork artwork = artworkRepository.findById(artworkId)
            .orElseThrow(() -> new ResourceNotFoundException("Artwork not found with id: " + artworkId));
        
        if (updateRequest.getTitle() != null) {
            artwork.setTitle(updateRequest.getTitle());
        }
        
        if (updateRequest.getDescription() != null) {
            artwork.setDescription(updateRequest.getDescription());
        }
        
        if (updateRequest.getPrice() != null) {
            artwork.setPrice(updateRequest.getPrice());
        }
        
        if (updateRequest.getCategory() != null) {
            artwork.setCategory(updateRequest.getCategory());
        }
        
        if (updateRequest.getMedium() != null) {
            artwork.setMedium(updateRequest.getMedium());
        }
        
        if (updateRequest.getImages() != null) {
            artwork.setImages(updateRequest.getImages());
        }
        
        if (updateRequest.getTags() != null) {
            artwork.setTags(updateRequest.getTags());
        }
        
        if (updateRequest.getIsAvailable() != null) {
            artwork.setIsAvailable(updateRequest.getIsAvailable());
        }
        
        if (updateRequest.getDimensions() != null) {
            if (artwork.getDimensions() == null) {
                artwork.setDimensions(new Dimensions());
            }
            
            if (updateRequest.getDimensions().getWidth() != null) {
                artwork.getDimensions().setWidth(updateRequest.getDimensions().getWidth());
            }
            
            if (updateRequest.getDimensions().getHeight() != null) {
                artwork.getDimensions().setHeight(updateRequest.getDimensions().getHeight());
            }
        }
        
        artworkRepository.save(artwork);
        return modelMapper.map(artwork, ArtworkDto.class);
    }

    @Override
    @Transactional
    public void deleteArtwork(String artworkId) {
        Artwork artwork = artworkRepository.findById(artworkId)
            .orElseThrow(() -> new ResourceNotFoundException("Artwork not found with id: " + artworkId));
        
        artworkRepository.delete(artwork);
    }

    @Override
    public Page<OrderDto> getOrders(int page, int limit, String status) {
        Pageable pageable = PageRequest.of(page - 1, limit);
        
        if (status != null) {
            try {
                OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
                List<Order> allOrders = orderRepository.findAll();
                List<Order> filteredOrders = allOrders.stream()
                    .filter(order -> order.getStatus() == orderStatus)
                    .collect(Collectors.toList());
                
                int start = (int) pageable.getOffset();
                int end = Math.min((start + pageable.getPageSize()), filteredOrders.size());
                
                List<Order> pageOrders = start < end ? filteredOrders.subList(start, end) : Collections.emptyList();
                Page<Order> orderPage = new PageImpl<>(pageOrders, pageable, filteredOrders.size());
                
                return orderPage.map(this::mapOrderToDto);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid order status: " + status);
            }
        } else {
            Page<Order> orders = orderRepository.findAll(pageable);
            return orders.map(this::mapOrderToDto);
        }
    }

    private OrderDto mapOrderToDto(Order order) {
        OrderDto orderDto = modelMapper.map(order, OrderDto.class);
        
        // Fetch order items
        List<OrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
        List<OrderItemDto> orderItemDtos = orderItems.stream()
            .map(item -> modelMapper.map(item, OrderItemDto.class))
            .collect(Collectors.toList());
        
        orderDto.setItems(orderItemDtos);
        return orderDto;
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(String orderId, String status) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(orderStatus);
            orderRepository.save(order);
            
            return mapOrderToDto(order);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid order status: " + status);
        }
    }

    @Override
    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        // Basic counts
        long totalUsers = userRepository.count();
        long totalArtists = userRepository.findByRole(Role.valueOf(UserRole.ARTIST)).size();
        long totalCustomers = userRepository.findByRole(Role.valueOf(UserRole.CUSTOMER)).size();
        long totalArtworks = artworkRepository.count();
        long totalOrders = orderRepository.count();
        
        analytics.put("totalUsers", totalUsers);
        analytics.put("totalArtists", totalArtists);
        analytics.put("totalCustomers", totalCustomers);
        analytics.put("totalArtworks", totalArtworks);
        analytics.put("totalOrders", totalOrders);
        
        // Revenue calculation
        double totalRevenue = orderRepository.findAll().stream()
            .mapToDouble(Order::getTotalAmount)
            .sum();
        
        analytics.put("totalRevenue", totalRevenue);
        
        // Recent orders
        List<Order> recentOrders = orderRepository.findAll().stream()
            .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
            .limit(5)
            .collect(Collectors.toList());
        
        List<OrderDto> recentOrderDtos = recentOrders.stream()
            .map(this::mapOrderToDto)
            .collect(Collectors.toList());
        
        analytics.put("recentOrders", recentOrderDtos);
        
        // Monthly stats (last 6 months)
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MONTH, -5); // Go back 5 months (for a total of 6 months including current)
        
        List<Map<String, Object>> monthlyStats = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            int month = calendar.get(Calendar.MONTH) + 1; // 1-based month
            int year = calendar.get(Calendar.YEAR);
            
            String monthName = new java.text.DateFormatSymbols().getMonths()[month - 1];
            
            // Filter orders for this month
            final int currentMonth = month;
            final int currentYear = year;
            
            List<Order> monthOrders = orderRepository.findAll().stream()
                .filter(order -> {
                    Calendar orderDate = Calendar.getInstance();
                    orderDate.setTime(java.sql.Timestamp.valueOf(order.getCreatedAt()));
                    return orderDate.get(Calendar.MONTH) + 1 == currentMonth &&
                           orderDate.get(Calendar.YEAR) == currentYear;
                })
                .collect(Collectors.toList());
            
            double monthRevenue = monthOrders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
            
            Map<String, Object> monthData = new HashMap<>();
            monthData.put("month", monthName);
            monthData.put("year", year);
            monthData.put("orders", monthOrders.size());
            monthData.put("revenue", monthRevenue);
            
            monthlyStats.add(monthData);
            
            // Move to next month
            calendar.add(Calendar.MONTH, 1);
        }
        
        analytics.put("monthlyStats", monthlyStats);
        
        return analytics;
    }
}
