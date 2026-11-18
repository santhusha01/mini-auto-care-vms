package com.miniautocare.jobcard;

import java.math.BigDecimal;
import java.util.List;

public record BillableSnapshot(
        Long jobCardId,
        String customerName,
        BigDecimal subtotal,
        List<Line> lines,   // services
        List<Line> parts) {

    public record Line(
            String type,          // "SERVICE" or "PART"
            String description,
            int quantity,
            BigDecimal unitPrice,
            BigDecimal lineTotal) {}
}