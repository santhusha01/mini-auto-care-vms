package com.miniautocare.auth;

public record LoginResponse(
        String token,
        long expiresIn,
        UserResponse user
) {}