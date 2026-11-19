package com.miniautocare.inventory;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {

    @Query("""
            select i from InventoryItem i
            where (lower(i.name) like lower(concat('%', :search, '%'))
                   or lower(i.code) like lower(concat('%', :search, '%')))
              and (:lowStock = false or i.quantity <= i.reorderLevel)
            """)
    Page<InventoryItem> search(@Param("search") String search,
                               @Param("lowStock") boolean lowStock,
                               Pageable pageable);

    @Query(value = "select nextval('item_seq')", nativeQuery = true)
    Long nextSeq();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from InventoryItem i where i.id = :id")
    Optional<InventoryItem> lockById(@Param("id") Long id);
}