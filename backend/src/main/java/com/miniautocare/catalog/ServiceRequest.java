package com.miniautocare.catalog;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ServiceRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @Size(max = 300, message = "Description must be at most 300 characters")
        String description,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.00", message = "Price must be >= 0")
        @Digits(integer = 10, fraction = 2, message = "Price must have up to 2 decimal places")
        BigDecimal price,

        Boolean active
) {}