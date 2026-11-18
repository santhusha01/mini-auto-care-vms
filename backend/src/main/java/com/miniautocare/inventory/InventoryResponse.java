package com.miniautocare.inventory;

import java.math.BigDecimal;

public record InventoryResponse(
        Long id,
        String code,
        String name,
        BigDecimal unitPrice,
        int quantity,
        int reorderLevel,
        boolean lowStock,
        boolean active) {
}