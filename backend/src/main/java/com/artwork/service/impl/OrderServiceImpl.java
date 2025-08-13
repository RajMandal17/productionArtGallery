package com.artwork.service.impl;

import com.artwork.dto.*;
import com.artwork.entity.Order;
import com.artwork.entity.OrderItem;
import com.artwork.entity.CartItem;
import com.artwork.entity.Artwork;
import com.artwork.repository.OrderRepository;
import com.artwork.repository.OrderItemRepository;
import com.artwork.repository.CartItemRepository;
import com.artwork.repository.ArtworkRepository;
import com.artwork.util.JwtUtil;
import com.artwork.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartItemRepository cartItemRepository;
    private final ArtworkRepository artworkRepository;
    private final ModelMapper modelMapper;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public OrderDto placeOrder(OrderRequestDto orderRequestDto, String token) {
        String userId = jwtUtil.extractUserId(token);
        double totalAmount = 0;
        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderItemRequestDto itemDto : orderRequestDto.getItems()) {
            Artwork artwork = artworkRepository.findById(itemDto.getArtworkId()).orElseThrow();
            double price = artwork.getPrice();
            totalAmount += price * itemDto.getQuantity();
            OrderItem orderItem = OrderItem.builder()
                    .artworkId(itemDto.getArtworkId())
                    .quantity(itemDto.getQuantity())
                    .price(price)
                    .build();
            orderItems.add(orderItem);
        }
        Order order = Order.builder()
                .customerId(userId)
                .totalAmount(totalAmount)
                .status(com.artwork.entity.OrderStatus.PENDING)
                .shippingAddress(orderRequestDto.getShippingAddress().toString())
                .paymentMethod(orderRequestDto.getPaymentMethod())
                .build();
        orderRepository.save(order);
        for (OrderItem orderItem : orderItems) {
            orderItem.setOrderId(order.getId());
            orderItemRepository.save(orderItem);
        }
        // Optionally clear cart
        List<CartItem> cartItems = cartItemRepository.findAll().stream()
                .filter(item -> item.getUserId().equals(userId))
                .collect(Collectors.toList());
        cartItemRepository.deleteAll(cartItems);
        return modelMapper.map(order, OrderDto.class);
    }

    @Override
    public List<OrderDto> getOrders(String token) {
        String userId = jwtUtil.extractUserId(token);
        List<Order> orders = orderRepository.findByCustomerId(userId);
        return orders.stream()
                .map(order -> modelMapper.map(order, OrderDto.class))
                .collect(Collectors.toList());
    }
    
    @Override
    public Page<OrderDto> getOrdersPaged(String token, Pageable pageable) {
        String userId = jwtUtil.extractUserId(token);
        Page<Order> orderPage = orderRepository.findByCustomerId(userId, pageable);
        return orderPage.map(order -> modelMapper.map(order, OrderDto.class));
    }
    
    @Override
    public OrderDto getOrderById(String id, String token) {
        String userId = jwtUtil.extractUserId(token);
        Order order = orderRepository.findById(id).orElseThrow(() -> 
            new RuntimeException("Order not found with id: " + id)
        );
        
        // Check if the order belongs to this user or if user is admin
        // This is a simplified check; in real implementation, you'd check for admin role
        if (!order.getCustomerId().equals(userId)) {
            throw new RuntimeException("You don't have permission to access this order");
        }
        
        return modelMapper.map(order, OrderDto.class);
    }
}
