package com.miniautocare.common;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void handleNotFound_returns404WithStandardFormat() {
        ResponseEntity<ApiResponse<Void>> res = handler.handleNotFound(new NotFoundException("Customer not found"));
        assertEquals(HttpStatus.NOT_FOUND, res.getStatusCode());
        assertNotNull(res.getBody());
        assertFalse(res.getBody().success());
        assertEquals("Customer not found", res.getBody().message());
    }

    @Test
    void handleConflict_returns409() {
        ResponseEntity<ApiResponse<Void>> res = handler.handleConflict(new ConflictException("Phone already exists"));
        assertEquals(HttpStatus.CONFLICT, res.getStatusCode());
        assertNotNull(res.getBody());
        assertEquals("Phone already exists", res.getBody().message());
    }

    @Test
    void handleAccessDenied_returns403() {
        ResponseEntity<ApiResponse<Void>> res = handler.handleAccessDenied(new AccessDeniedException("Denied"));
        assertEquals(HttpStatus.FORBIDDEN, res.getStatusCode());
        assertNotNull(res.getBody());
        assertEquals("Access denied", res.getBody().message());
    }
}