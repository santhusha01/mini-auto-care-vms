package com.miniautocare.billing;

import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    boolean existsByJobCardId(Long jobCardId);
}