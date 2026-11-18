package com.miniautocare.catalog;

import com.miniautocare.common.ConflictException;
import com.miniautocare.common.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final ServiceUsageChecker serviceUsageChecker;

    @Transactional(readOnly = true)
    public Page<ServiceResponse> getAllServices(String search, Boolean active, Pageable pageable) {
        String cleanSearch = (search == null || search.isBlank()) ? null : search.trim();
        return serviceRepository.searchServices(cleanSearch, active, pageable)
                .map(ServiceResponse::from);
    }

    @Transactional(readOnly = true)
    public ServiceResponse getServiceById(Long id) {
        ServiceItem item = serviceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Service not found with id: " + id));
        return ServiceResponse.from(item);
    }

    @Transactional
    public ServiceResponse createService(ServiceRequest request) {
        String cleanName = request.name().trim();
        if (serviceRepository.existsByNameIgnoreCase(cleanName)) {
            throw new ConflictException("Service name already exists");
        }

        ServiceItem item = ServiceItem.builder()
                .name(cleanName)
                .description(request.description() != null ? request.description().trim() : null)
                .price(request.price().setScale(2, RoundingMode.HALF_UP))
                .active(request.active() != null ? request.active() : true)
                .build();

        return ServiceResponse.from(serviceRepository.save(item));
    }

    @Transactional
    public ServiceResponse updateService(Long id, ServiceRequest request) {
        ServiceItem item = serviceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Service not found with id: " + id));

        String cleanName = request.name().trim();
        if (serviceRepository.existsByNameIgnoreCaseAndIdNot(cleanName, id)) {
            throw new ConflictException("Service name already exists");
        }

        item.setName(cleanName);
        item.setDescription(request.description() != null ? request.description().trim() : null);
        item.setPrice(request.price().setScale(2, RoundingMode.HALF_UP));
        if (request.active() != null) {
            item.setActive(request.active());
        }

        return ServiceResponse.from(serviceRepository.save(item));
    }

    @Transactional
    public void deleteService(Long id) {
        ServiceItem item = serviceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Service not found with id: " + id));

        if (serviceUsageChecker.isServiceUsedInJobCards(id)) {
            item.setActive(false);
            serviceRepository.save(item);
            throw new ConflictException("Service is used in job cards; marked as inactive instead of deleting");
        }

        serviceRepository.delete(item);
    }
}