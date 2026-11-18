package com.miniautocare.inventory;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record InventoryRequest(
        @NotBlank(message = "Name is required") @Size(max = 100) String name,
        @NotNull(message = "Unit price is required") @DecimalMin("0.00") BigDecimal unitPrice,
        @Min(0) int quantity,
        @Min(0) int reorderLevel) {
}