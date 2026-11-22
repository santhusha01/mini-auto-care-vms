package com.miniautocare.auth;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }
        userRepository.save(new User(
                "admin",
                passwordEncoder.encode("Admin@123"),
                "Administrator",
                "ADMIN"
        ));
        userRepository.save(new User(
                "staff",
                passwordEncoder.encode("Staff@123"),
                "Staff Member",
                "STAFF"
        ));
    }
}