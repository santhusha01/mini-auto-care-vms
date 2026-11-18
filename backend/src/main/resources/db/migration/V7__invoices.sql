CREATE SEQUENCE invoice_seq START 1;

CREATE TABLE invoices (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(12) NOT NULL UNIQUE,
  job_card_id BIGINT NOT NULL UNIQUE REFERENCES job_cards(id),
  customer_name VARCHAR(100) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
  status VARCHAR(10) NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID','PAID')),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  paid_at TIMESTAMP
);

CREATE TABLE invoice_items (
  id BIGSERIAL PRIMARY KEY,
  invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  item_type VARCHAR(10) NOT NULL CHECK (item_type IN ('SERVICE','PART')),
  description VARCHAR(150) NOT NULL,
  quantity INT NOT NULL,
  unit_price NUMERIC(12,2) NOT NULL,
  line_total NUMERIC(12,2) NOT NULL
);