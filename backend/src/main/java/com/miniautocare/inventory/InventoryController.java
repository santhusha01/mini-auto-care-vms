package com.miniautocare.inventory;

import com.miniautocare.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final InventoryService service;

    public InventoryController(InventoryService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<Page<InventoryResponse>> list(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "false") boolean lowStock,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(service.list(search, lowStock,
                PageRequest.of(page, size, Sort.by("id").descending())));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<InventoryResponse> create(@Valid @RequestBody InventoryRequest r) {
        return ApiResponse.ok("Created", service.create(r));
    }

    @GetMapping("/{id}")
    public ApiResponse<InventoryResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<InventoryResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody InventoryRequest r) {
        return ApiResponse.ok("Updated", service.update(id, r));
    }

    @PutMapping("/{id}/stock")
    public ApiResponse<InventoryResponse> stock(@PathVariable Long id,
                                                @Valid @RequestBody StockAdjustRequest r) {
        return ApiResponse.ok("Stock updated", service.adjustStock(id, r.delta()));
    }

    // TODO ADMIN only: add @PreAuthorize("hasRole('ADMIN')") once Dev 1 adds SecurityConfig + @EnableMethodSecurity
    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.ok("Deleted", null);
    }
}