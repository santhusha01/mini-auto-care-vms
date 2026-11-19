package com.miniautocare.inventory;

import com.miniautocare.common.BadRequestException;
import com.miniautocare.common.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private final InventoryItemRepository repo;

    public InventoryService(InventoryItemRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public InventoryResponse create(InventoryRequest r) {
        InventoryItem i = new InventoryItem();
        i.setCode(String.format("ITM-%04d", repo.nextSeq()));
        i.setName(r.name());
        i.setUnitPrice(r.unitPrice());
        i.setQuantity(r.quantity());
        i.setReorderLevel(r.reorderLevel());
        return toDto(repo.save(i));
    }

    @Transactional(readOnly = true)
    public Page<InventoryResponse> list(String search, boolean lowStock, Pageable pageable) {
        String s = search == null ? "" : search.trim();
        return repo.search(s, lowStock, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public InventoryResponse get(Long id) {
        return toDto(find(id));
    }

    @Transactional
    public InventoryResponse update(Long id, InventoryRequest r) {
        InventoryItem i = find(id);
        i.setName(r.name());
        i.setUnitPrice(r.unitPrice());
        i.setReorderLevel(r.reorderLevel());
        // quantity is NOT changed here; stock changes only through adjustStock
        return toDto(i);
    }

    @Transactional
    public InventoryResponse adjustStock(Long id, int delta) {
        InventoryItem i = repo.lockById(id)
                .orElseThrow(() -> new NotFoundException("Item not found"));
        int result = i.getQuantity() + delta;
        if (result < 0) {
            throw new BadRequestException("Stock cannot go below 0");
        }
        i.setQuantity(result);
        return toDto(i);
    }

    @Transactional
    public void delete(Long id) {
        repo.delete(find(id));
    }

    private InventoryItem find(Long id) {
        return repo.findById(id).orElseThrow(() -> new NotFoundException("Item not found"));
    }

    private InventoryResponse toDto(InventoryItem i) {
        return new InventoryResponse(i.getId(), i.getCode(), i.getName(), i.getUnitPrice(),
                i.getQuantity(), i.getReorderLevel(),
                i.getQuantity() <= i.getReorderLevel(), i.isActive());
    }
}