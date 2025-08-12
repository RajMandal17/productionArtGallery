package com.artwork.service;

import com.artwork.dto.OrderRequestDto;
import com.artwork.dto.OrderDto;
import java.util.List;

public interface OrderService {
    OrderDto placeOrder(OrderRequestDto orderRequestDto, String token);
    List<OrderDto> getOrders(String token);
    List<OrderDto> getOrders(String token, Integer page, Integer limit);
    OrderDto getOrderById(String id, String token);
}
