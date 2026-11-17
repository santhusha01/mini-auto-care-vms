# Mini Auto Care VMS — Architecture & Security Standards

## 1. System Overview (Modular Monolith)
* **Architecture:** One Spring Boot 3 backend (`backend/`), one React + TypeScript frontend (`frontend/`), one PostgreSQL database (`mini_auto_care`).
* **Base Package:** `com.miniautocare`
* **Module Packages:**
  * `common` — `ApiResponse`, custom exceptions, `GlobalExceptionHandler`, security & CORS config (Dev 1)
  * `auth` — Login, JWT, `User` entity, Dashboard API (Dev 1)
  * `customer` — Customer CRUD (Dev 2)
  * `jobcard` — Job cards & service lines (Dev 2)
  * `inventory` — Parts stock & job card parts usage (Dev 3)
  * `catalog` — Services price list (Dev 4)
  * `billing` — Invoices & payments (Dev 5)

## 2. Layering & Cross-Module Rules
* **Strict Flow:** `Controller` → `Service` → `Repository` → `Database`.
* **Controllers NEVER call Repositories directly.**
* **Cross-Module Calls:** A module may access another module **only** through its public `*QueryService` or `*Service` interface (never its repository). If not ready yet, create a stub marked `// TODO replace with Dev N`.
* **Class & Method Size:** One clear responsibility per class; keep methods short (~30 lines max).

## 3. Naming & DTO Rules
* **Naming Convention:** `<Module>Controller`, `<Module>Service`, `<Module>Repository`, `<Module>Request`, `<Module>Response`.
* **DTOs Only:** Entities (`@Entity`) must **never** be returned from controllers or accepted as request bodies.
* **Validation:** Put Jakarta validation annotations (`@NotBlank`, `@NotNull`, `@PositiveOrZero`, etc.) on all Request DTOs and `@Valid` on controller parameters.
* **Data Types:** Always use `BigDecimal` (2 decimal places) for money. Generate codes (`CUS-0001`, `JC-0001`, `ITM-0001`, `INV-0001`) using database sequences.

## 4. Standard JSON Response & Error Format
Every endpoint returns `ApiResponse<T>`:
```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "errors": null,
  "timestamp": "2026-11-16T10:00:00"
}