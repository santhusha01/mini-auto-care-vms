# Test Plan: Mini Auto Care VMS

Owner: Dev 3 (QA and Testing). Tools: JUnit 5, Mockito, Postman / Newman, Jira bugs.

## 1. Severity levels
| Level | Example | Fix within |
|---|---|---|
| Highest | cannot login, app crash | 2 hours |
| High | wrong invoice total, stock goes negative | same day |
| Medium | wrong validation message | next day |
| Low | UI spacing | backlog |

## 2. Definition of done
A task is done when its tests pass and QA has retested it.

## 3. Test cases per module
Each module has one happy path and two error cases.

| Module | Happy path | Error case 1 | Error case 2 |
|---|---|---|---|
| Auth | Login returns a token | Wrong password gives 401 | Expired or missing token gives 401 |
| Customers | Create, search and edit a customer | Duplicate phone gives 409 | STAFF delete gives 403 |
| Services | Create a service, list active ones | Duplicate name gives 409 | Inactive service cannot be added to a job card |
| Inventory | Create item, search, adjust stock | Stock below 0 gives 400 | Item not found gives 404 |
| Job cards | Create, then OPEN to IN_PROGRESS to COMPLETED | Invalid status jump gives 400 | Adding a part to a COMPLETED job card gives 400 |
| Invoices | Generate from a COMPLETED job card, mark paid | Job card not completed gives 400 | Second invoice for the same job card gives 409 |

## 4. Test types
- **Unit tests (JUnit 5 + Mockito):** each developer tests the rules of their own service (duplicate phone, status order, stock never negative, invoice totals, inactive service). Run with `mvn test` in CI on every PR.
- **API tests (Postman / Newman):** one folder per module, variables `baseUrl` and `token`, role tests (STAFF delete gives 403, no token gives 401). Collection stored in `postman/`.
- **End-to-end test:** login, customer, job card, services and part, complete, invoice, pay. Check dashboard numbers change. Run as ADMIN and as STAFF, then repeat on the deployed URL on Day 4.

## 5. Bug reporting
Every bug is a Jira issue with: module, environment (local or live), steps, expected result, actual result, screenshot or Postman response, and priority. Assign it to the module owner. A bug is closed only after QA retests the fix, and every fixed bug gets a regression test.