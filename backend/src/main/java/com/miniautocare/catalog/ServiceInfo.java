package com.miniautocare.catalog;

import java.math.BigDecimal;

public record ServiceInfo(
        Long id,
        String name,
        BigDecimal price
) {}