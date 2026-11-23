CREATE TABLE job_cards (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(id),
    vehicle_reg_no VARCHAR(20) NOT NULL,
    vehicle_make VARCHAR(50),
    vehicle_model VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_card_services (
    id BIGSERIAL PRIMARY KEY,
    job_card_id BIGINT NOT NULL REFERENCES job_cards(id) ON DELETE CASCADE,
    service_id BIGINT NOT NULL REFERENCES services(id),
    price NUMERIC(10, 2) NOT NULL
);