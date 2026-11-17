package com.miniautocare.catalog;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ServiceRepository extends JpaRepository<ServiceItem, Long> {

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    @Query("""
            SELECT s FROM ServiceItem s
            WHERE (:active IS NULL OR s.active = :active)
              AND (:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
                   OR LOWER(COALESCE(s.description, '')) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
            ORDER BY s.name ASC
            """)
    Page<ServiceItem> searchServices(
            @Param("search") String search,
            @Param("active") Boolean active,
            Pageable pageable
    );
}