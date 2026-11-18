package com.miniautocare.catalog;

import com.miniautocare.common.BadRequestException;
import com.miniautocare.common.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ServiceCatalogServiceImpl implements ServiceCatalogService {

    private final ServiceRepository serviceRepository;

    @Override
    @Transactional(readOnly = true)
    public ServiceInfo getActiveService(Long id) {
        ServiceItem service = serviceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Service not found with id: " + id));
        if (!service.isActive()) {
            throw new BadRequestException("Service is inactive and cannot be added to a job card");
        }
        return new ServiceInfo(service.getId(), service.getName(), service.getPrice());
    }
}