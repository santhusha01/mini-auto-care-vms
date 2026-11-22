CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'STAFF')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Default seed users (BCrypt hashes: admin -> admin123, staff -> staff123)
INSERT INTO users (username, password_hash, full_name, role, active)
VALUES
    ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System Admin', 'ADMIN', TRUE),
    ('staff', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQ16/0f.C8/J1T/q5P2Y6R/0q5e2Hy', 'Workshop Staff', 'STAFF', TRUE);
