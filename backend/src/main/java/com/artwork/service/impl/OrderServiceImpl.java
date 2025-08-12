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
import com.artwork.security.JwtUtil;
import com.artwork.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
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

    @Transactional
    public OrderDto placeOrder(OrderRequestDto orderRequestDto, String token) {
        String userId = jwtUtil.getClaims(token).getSubject();
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

    public List<OrderDto> getOrders(String token) {
        return getOrders(token, null, null);
    }
    
    @Override
    public List<OrderDto> getOrders(String token, Integer page, Integer limit) {
        String userId = jwtUtil.getClaims(token).getSubject();
        List<Order> orders = orderRepository.findAll().stream()
                .filter(order -> order.getCustomerId().equals(userId))
                .collect(Collectors.toList());
        
        // Apply pagination if specified
        if (page != null && limit != null) {
            int startIndex = page * limit;
            if (startIndex < orders.size()) {
                int endIndex = Math.min(startIndex + limit, orders.size());
                orders = orders.subList(startIndex, endIndex);
            } else {
                orders = Collections.emptyList();
            }
        }
        
        return orders.stream()
                .map(order -> modelMapper.map(order, OrderDto.class))
                .collect(Collectors.toList());
    }
    
    @Override
    public OrderDto getOrderById(String id, String token) {
        String userId = jwtUtil.getClaims(token).getSubject();
        Order order = orderRepository.findById(id).orElseThrow(() -> 
                new RuntimeException("Order not found with id: " + id));
        
        // Verify that the order belongs to the authenticated user
        if (!order.getCustomerId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to order");
        }
        
        return modelMapper.map(order, OrderDto.class);
    }
}
