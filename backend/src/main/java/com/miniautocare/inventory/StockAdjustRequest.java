package com.miniautocare.inventory;

import jakarta.validation.constraints.NotNull;

public record StockAdjustRequest(
        @NotNull(message = "Delta is required") Integer delta,
        String reason) {
}