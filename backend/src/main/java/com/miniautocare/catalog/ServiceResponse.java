package com.miniautocare.catalog;

import java.math.BigDecimal;

public record ServiceResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        boolean active
) {
    public static ServiceResponse from(ServiceItem item) {
        return new ServiceResponse(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.isActive()
        );
    }
}