# API Standards, Mini Auto Care VMS

Owner: Dev 5. Changes to this file go through Dev 5 and are updated the same day.

## 1. REST rules
- Base path: `/api/<plural-noun>` (e.g. `/api/customers`, `/api/job-cards`)
- JSON only. Field names are camelCase.
- List: `GET /api/customers?page=0&size=10&search=`
- Actions are sub-paths: `PUT /api/job-cards/{id}/status`, `PUT /api/invoices/{id}/pay`
- Only ADMIN may DELETE.
- Never return entities, always DTOs.

| Action | Method + path | Success |
|---|---|---|
| List | GET /api/customers?page=0&size=10&search= | 200 |
| Create | POST /api/customers | 201 |
| Read | GET /api/customers/{id} | 200 / 404 |
| Update | PUT /api/customers/{id} | 200 |
| Delete | DELETE /api/customers/{id} (ADMIN) | 200 |
| Action | PUT /api/job-cards/{id}/status | 200 / 400 |

## 2. Status codes
200 OK, 201 Created, 400 validation or rule broken, 401 no/invalid token,
403 forbidden (e.g. STAFF deleting), 404 not found, 409 conflict (duplicate / wrong state).

## 3. Response format
Success:
`{ "success": true, "message": "...", "data": {}, "timestamp": "2026-11-18T10:00:00" }`

Error:
`{ "success": false, "message": "...", "errors": { "field": "msg" }, "timestamp": "..." }`

All of 400 / 401 / 403 / 404 / 409 use the error shape.

## 4. Paging
`{ content: [], totalElements, number, size }` inside `data`.

## 5. Codes and money
- Money: BigDecimal, 2 decimals (JSON numbers like 4200.00)
- Codes from sequences: CUS-0001, JC-0001, ITM-0001, INV-0001

## 6. Invoice endpoints (Dev 5)
- POST /api/invoices `{ "jobCardId": 14, "discount": 1000.00 }` -> 201
- GET /api/invoices?status=UNPAID&page=0&size=10&search= -> 200
- GET /api/invoices/{id} -> 200 / 404
- PUT /api/invoices/{id}/pay -> 200 (409 if already PAID)
- Job card not COMPLETED -> 400. Second invoice for same job card -> 409.

## 7. Field names confirmed
(Fill in as each dev confirms: Customers/Job Cards = Dev 2, Inventory = Dev 3, Services = Dev 4, Login/Dashboard = Dev 1)