package com.miniautocare.catalog;

import com.miniautocare.common.BadRequestException;
import com.miniautocare.common.ConflictException;
import com.miniautocare.common.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ServiceServiceTest {

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private ServiceUsageChecker serviceUsageChecker;

    @InjectMocks
    private ServiceService serviceService;

    @InjectMocks
    private ServiceCatalogServiceImpl serviceCatalogService;

    @Test
    void createService_validRequest_trimsNameScalesPriceAndSaves() {
        ServiceRequest request = new ServiceRequest(
                "  Oil & Filter Change  ",
                "  Engine oil + filter  ",
                new BigDecimal("4200"),
                null
        );

        when(serviceRepository.existsByNameIgnoreCase("Oil & Filter Change")).thenReturn(false);
        when(serviceRepository.save(any(ServiceItem.class))).thenAnswer(invocation -> {
            ServiceItem item = invocation.getArgument(0);
            item.setId(1L);
            return item;
        });

        ServiceResponse response = serviceService.createService(request);

        assertEquals(1L, response.id());
        assertEquals("Oil & Filter Change", response.name());
        assertEquals("Engine oil + filter", response.description());
        assertEquals(new BigDecimal("4200.00"), response.price());
        assertTrue(response.active());
        verify(serviceRepository).save(any(ServiceItem.class));
    }

    @Test
    void createService_duplicateName_throwsConflictException() {
        ServiceRequest request = new ServiceRequest(
                "Brake Inspection",
                "Pads and discs",
                new BigDecimal("2000.00"),
                true
        );

        when(serviceRepository.existsByNameIgnoreCase("Brake Inspection")).thenReturn(true);

        assertThrows(ConflictException.class, () -> serviceService.createService(request));
        verify(serviceRepository, never()).save(any());
    }

    @Test
    void deleteService_usedInJobCard_marksInactiveAndThrowsConflictException() {
        ServiceItem existing = ServiceItem.builder()
                .id(5L)
                .name("Wheel Alignment")
                .description("4 wheels")
                .price(new BigDecimal("3800.00"))
                .active(true)
                .build();

        when(serviceRepository.findById(5L)).thenReturn(Optional.of(existing));
        when(serviceUsageChecker.isServiceUsedInJobCards(5L)).thenReturn(true);
        when(serviceRepository.save(any(ServiceItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThrows(ConflictException.class, () -> serviceService.deleteService(5L));

        assertFalse(existing.isActive());
        verify(serviceRepository).save(existing);
        verify(serviceRepository, never()).delete(any());
    }

    @Test
    void deleteService_unusedService_deletesDirectly() {
        ServiceItem existing = ServiceItem.builder()
                .id(6L)
                .name("AC Gas Top-up")
                .description("Refrigerant check")
                .price(new BigDecimal("5500.00"))
                .active(true)
                .build();

        when(serviceRepository.findById(6L)).thenReturn(Optional.of(existing));
        when(serviceUsageChecker.isServiceUsedInJobCards(6L)).thenReturn(false);

        serviceService.deleteService(6L);

        verify(serviceRepository).delete(existing);
        verify(serviceRepository, never()).save(any());
    }

    @Test
    void getServiceById_notFound_throwsNotFoundException() {
        when(serviceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> serviceService.getServiceById(99L));
    }

    @Test
    void getActiveService_inactiveService_throwsBadRequestException() {
        ServiceItem inactiveItem = ServiceItem.builder()
                .id(3L)
                .name("Old Service")
                .description("Discontinued")
                .price(new BigDecimal("1000.00"))
                .active(false)
                .build();

        when(serviceRepository.findById(3L)).thenReturn(Optional.of(inactiveItem));

        assertThrows(BadRequestException.class, () -> serviceCatalogService.getActiveService(3L));
    }

    @Test
    void getActiveService_activeService_returnsServiceInfo() {
        ServiceItem activeItem = ServiceItem.builder()
                .id(2L)
                .name("Brake Inspection")
                .description("Pads and discs")
                .price(new BigDecimal("2000.00"))
                .active(true)
                .build();

        when(serviceRepository.findById(2L)).thenReturn(Optional.of(activeItem));

        ServiceInfo info = serviceCatalogService.getActiveService(2L);

        assertEquals(2L, info.id());
        assertEquals("Brake Inspection", info.name());
        assertEquals(new BigDecimal("2000.00"), info.price());
    }
}
