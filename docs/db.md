# Database Management & Schema Guide — Mini Auto Care VMS

**Primary Owner:** Dev 4 (Services)  
**Support:** Dev 3 (Inventory), Dev 5 (Billing & Invoices)  
**Database:** PostgreSQL 16 (`mini_auto_care`)  
**Migration Tool:** Flyway (`spring.jpa.hibernate.ddl-auto=validate`)

---

## 1. EER Diagram
- Diagram file: `docs/eer.png` (source: `docs/eer.drawio` / `docs/eer.dbml`)
- **9 Tables:** `users`, `customers`, `services`, `inventory_items`, `job_cards`, `job_card_services`, `job_card_parts`, `invoices`, `invoice_items`

---

## 2. Flyway Migration Order (V1 – V7)

> **STRICT RULES:**
> 1. **Never edit** a migration file once it is merged to `main` (causes Flyway checksum errors for the whole team).
> 2. If a schema fix is needed later, create a new migration (`V8__...`).
> 3. Never modify the database manually in shared/deployed environments.
> 4. `ddl-auto: validate` is enforced so Hibernate never alters tables automatically.

| Order | Migration File | Owner | Tables Created | Depends On |
| :--- | :--- | :--- | :--- | :--- |
| **V1** | `V1__users.sql` | Dev 1 | `users` | — |
| **V2** | `V2__customers.sql` | Dev 2 | `customers` | — |
| **V3** | `V3__services.sql` | Dev 4 | `services` | — |
| **V4** | `V4__inventory_items.sql` | Dev 3 | `inventory_items` | — |
| **V5** | `V5__job_cards.sql` | Dev 2 | `job_cards`, `job_card_services` | V1 (`users`), V2 (`customers`), V3 (`services`) |
| **V6** | `V6__job_card_parts.sql` | Dev 3 | `job_card_parts` | V4 (`inventory_items`), V5 (`job_cards`) |
| **V7** | `V7__invoices.sql` | Dev 5 | `invoices`, `invoice_items` | V5 (`job_cards`) |
| **V8** | `V8__demo_data.sql` | Dev 4 | Seed data + sequence `setval` | V1–V7 |

---

## 3. Normalization (3NF) & Snapshot Audit

| Normal Form | Verification Rule | How Mini Auto Care VMS Satisfies It |
| :--- | :--- | :--- |
| **1NF** | Atomic columns; no repeating groups or comma-separated lists. | Services and parts of a job card are stored as separate rows in `job_card_services` and `job_card_parts`. |
| **2NF** | No partial dependency on a composite key. | Every table uses a single surrogate `BIGSERIAL PRIMARY KEY (id)`; child tables depend only on their own `id`. |
| **3NF** | No transitive dependencies (non-key columns depend only on PK). | Customer details (`name`, `phone`) are not duplicated in `job_cards`; fetched via `customer_id` FK. |
| **Intentional Snapshots** | Historical accuracy when master catalog prices/names change. | `job_card_services` (`service_name`, `unit_price`), `job_card_parts` (`item_name`, `unit_price`), and `invoice_items` (`description`, `unit_price`, `line_total`) intentionally copy values at insertion time. |

---

## 4. Relationships & Constraints Checklist (PR Review Standard)

- **Relationships:**
  - `customers` **1 — N** `job_cards` (`customer_id` FK)
  - `users` **1 — N** `job_cards` (`created_by` FK)
  - `job_cards` **1 — N** `job_card_services` (`job_card_id` FK, `ON DELETE CASCADE`)
  - `services` **1 — N** `job_card_services` (`service_id` FK, `ON DELETE RESTRICT`)
  - `job_cards` **1 — N** `job_card_parts` (`job_card_id` FK, `ON DELETE CASCADE`)
  - `inventory_items` **1 — N** `job_card_parts` (`item_id` FK, `ON DELETE RESTRICT`)
  - `job_cards` **1 — 1** `invoices` (`job_card_id` FK + `UNIQUE`)
  - `invoices` **1 — N** `invoice_items` (`invoice_id` FK, `ON DELETE CASCADE`)
- **UNIQUE Constraints:** `users.username`, `customers.code`, `customers.phone`, `services.name`, `inventory_items.code`, `job_cards.code`, `invoices.code`, `invoices.job_card_id`.
- **CHECK Constraints:**
  - Valid status enums (`users.role`, `job_cards.status`, `invoices.status`, `invoice_items.item_type`)
  - Non-negative quantities: `inventory_items.quantity >= 0`, `inventory_items.reorder_level >= 0`, line `quantity > 0`
  - Non-negative money (`NUMERIC(12,2)`): `price >= 0`, `unit_price >= 0`, `subtotal >= 0`, `discount >= 0`, `total >= 0`
- **Sequences for Codes:** `customer_seq` (`CUS-0001`), `job_card_seq` (`JC-0001`), `item_seq` (`ITM-0001`), `invoice_seq` (`INV-0001`).

---

## 5. Data Integrity Verification Queries (Must Return 0 Rows)

Run these queries against PostgreSQL after E2E testing (Day 3 & Day 4). Every query **must return 0 rows**:

```sql
-- 1. No negative stock or negative unit price
SELECT id FROM inventory_items WHERE quantity < 0 OR unit_price < 0;

-- 2. Strictly one invoice per job card
SELECT job_card_id, COUNT(*) FROM invoices GROUP BY job_card_id HAVING COUNT(*) > 1;

-- 3. No orphan job cards without a valid customer
SELECT jc.id FROM job_cards jc LEFT JOIN customers c ON c.id = jc.customer_id WHERE c.id IS NULL;

-- 4. Invoice totals match sum of line items minus discount
SELECT i.id
FROM invoices i
JOIN (SELECT invoice_id, SUM(line_total) AS s FROM invoice_items GROUP BY invoice_id) x
  ON x.invoice_id = i.id
WHERE i.subtotal <> x.s OR i.total <> (i.subtotal - i.discount);

-- 5. Completed job cards must have a completed_at timestamp
SELECT id FROM job_cards WHERE status = 'COMPLETED' AND completed_at IS NULL;