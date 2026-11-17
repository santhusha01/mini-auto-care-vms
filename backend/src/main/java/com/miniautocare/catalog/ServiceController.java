package com.miniautocare.catalog;

import com.miniautocare.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService serviceService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ServiceResponse>>> getServices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ServiceResponse> result = serviceService.getAllServices(search, active, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceResponse>> getServiceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(serviceService.getServiceById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceResponse>> createService(@Valid @RequestBody ServiceRequest request) {
        ServiceResponse created = serviceService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Service created", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceResponse>> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRequest request
    ) {
        ServiceResponse updated = serviceService.updateService(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Service updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        serviceService.deleteService(id);
        return ResponseEntity.ok(ApiResponse.ok("Service deleted", null));
    }
}