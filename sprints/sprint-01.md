# Sprint 01 — Foundation, Auth & Core Ticket MVP

**Sprint Goal:** Bootstrap the full stack, implement multi-tenant authentication, and ship a working ticket CRUD that an agent can create, list, view, and update end-to-end.

**Models:** Hermes = deepseek/deepseek-v4-pro | OpenClaw = z-ai/glm-5.1

---

## Legend

| Priority | Meaning |
|----------|---------|
| **MUST** | Blocks all later work; required for a demo-able MVP. |
| **SHOULD** | Valuable feature; can be cut if MUST items slip. |
| **STRETCH** | Nice-to-have; only if everything above is done and green. |

---

## Milestone 1.1 — Bootstrap & Tooling
**Priority:** MUST  
**Estimated Effort:** 2–3 hours

### Goal
Install and configure Laravel 11 + React 19 + Vite + Tailwind + Sanctum. Ensure the GitHub Actions CI workflow passes from a fresh clone.

### Database Schema
*No new tables yet. Only Laravel default migrations (`users`, `password_resets`, `failed_jobs`, `personal_access_tokens`).*

### Backend Tasks
- `composer create-project laravel/laravel .` inside `backend/`
- Require `laravel/sanctum`
- Publish Sanctum config & migration
- Configure `config/cors.php` for `127.0.0.1:5173`
- Ensure `php artisan migrate --force` runs cleanly in CI
- Update `phpunit.xml` to use `pulsedesk_test` database

### Frontend Tasks
- `npm create vite@latest . -- --template react` inside `frontend/`
- Install Tailwind CSS v4 (or v3 if v4 compat issues arise), PostCSS, autoprefixer
- Install `react-router-dom`, `axios`
- Create basic folder structure: `src/pages/`, `src/components/`, `src/hooks/`, `src/contexts/`, `src/lib/`
- Verify `npm run dev` starts without errors

### API Endpoints
*None new — only verify Laravel’s default `/` route returns 200 and Sanctum config is loadable.*

### Tests
- CI workflow runs green (backend `migrate --force` + `php artisan test`)
- Frontend build completes (`npm run build` exits 0)

### Suggested Git Commit
```
chore: bootstrap laravel 11 + react 19 + vite + tailwind + sanctum
```

---

## Milestone 1.2 — Multi-tenant Auth & Seeding
**Priority:** MUST  
**Estimated Effort:** 3–4 hours

### Goal
Users belong to an `Organization`. The tenant is derived from the **authenticated user/session**, never from a client header. Three roles exist: `admin`, `agent`, `customer`. Demo accounts are seeded.

### Database Schema
```sql
organizations
  id                bigint unsigned PK
  name              varchar(255)
  slug              varchar(255) unique
  created_at        timestamp
  updated_at        timestamp

users
  id                bigint unsigned PK
  organization_id   bigint unsigned FK → organizations.id
  name              varchar(255)
  email             varchar(255) unique
  email_verified_at timestamp nullable
  password          varchar(255)
  role              enum('admin','agent','customer') default 'customer'
  remember_token    varchar(100)
  created_at        timestamp
  updated_at        timestamp
```

### Backend Tasks
- Create `Organization` model + migration + factory
- Create `User` model (extend default) with `organization_id`, `role`, `belongsTo Organization`
- Add `HasOrganization` global scope or override `booted()` so every query is `->where('organization_id', auth()->user()->organization_id)`
- Write `EnsureUserBelongsToTenant` middleware: reject if route model binding returns a record from another org
- Auth controllers:
  - `RegisterController` — create org + user atomically, return Sanctum token
  - `LoginController` — validate credentials, return Sanctum token
  - `LogoutController` — revoke current token
- Seeders:
  - `OrganizationSeeder`: Acme Corp, Beta Ltd
  - `UserSeeder`:  
    - `admin@acme.test` / `password` → role `admin`, org Acme  
    - `agent@acme.test` / `password` → role `agent`, org Acme  
    - `customer@acme.test` / `password` → role `customer`, org Acme  
    - `customer@beta.test` / `password` → role `customer`, org Beta

### Frontend Tasks
- Create `AuthContext` (React Context) holding `token`, `user`, `login()`, `logout()`
- Create `apiClient` Axios instance with `Authorization: Bearer <token>` interceptor
- Build `LoginPage` with email + password form, error handling, stores token in `localStorage`
- Build `RegisterPage` with name, email, password, org name fields
- Build a `ProtectedRoute` wrapper that redirects to `/login` if no token

### API Endpoints
| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | `/api/register` | No | `name, email, password, organization_name` | `{ token, user }` |
| POST | `/api/login` | No | `email, password` | `{ token, user }` |
| POST | `/api/logout` | Yes | — | `204` |
| GET | `/api/me` | Yes | — | `{ user }` |

### Tests
- **Backend PHPUnit:**
  - `RegisterTest` — can register, creates org + user, returns token
  - `LoginTest` — valid credentials return token; invalid return 401
  - `TenantScopeTest` — user A from Org 1 cannot query User records from Org 2 via direct DB call
  - `LogoutTest` — token is revoked
- **Frontend (manual):**
  - Login with seeded credentials → token stored → `/me` returns correct user
  - Refresh page → still authenticated (localStorage token)
  - Logout → token removed → redirected to login

### Suggested Git Commit
```
feat: multi-tenant auth with organizations, roles, and demo seeders
```

---

## Milestone 1.3 — Ticket Backend (CRUD + Policies)
**Priority:** MUST  
**Estimated Effort:** 3–4 hours

### Goal
Ticket model lives under the tenant. Agents and admins can see all tickets in their org. Customers can only see tickets they created. Tickets have status, priority, requester, and optional assignee.

### Database Schema
```sql
tickets
  id                bigint unsigned PK
  organization_id   bigint unsigned FK → organizations.id
  subject           varchar(255)
  description       text
  status            enum('open','pending','resolved','closed') default 'open'
  priority          enum('low','medium','high','urgent') default 'medium'
  requester_id      bigint unsigned FK → users.id
  assignee_id       bigint unsigned FK → users.id nullable
  created_at        timestamp
  updated_at        timestamp
```

### Backend Tasks
- `Ticket` model with `organization_id`, `requester`, `assignee` belongsTo relations
- Global tenant scope on `Ticket` via `booted()`
- `TicketPolicy`:
  - `viewAny` → admin/agent can see all org tickets; customer only their own
  - `view` → same as above
  - `create` → any authenticated user in the org
  - `update` → admin/agent can update any org ticket; customer only their own (and only certain fields?)
- `TicketController`:
  - `index()` — tenant-scoped, filterable by `status`, `priority`, `assignee_id`
  - `store()` — create ticket, auto-set `requester_id = auth()->id()`
  - `show()` — eager-load requester + assignee
  - `update()` — update status, priority, assignee
- `TicketFactory` for testing
- `TicketSeeder` — 20 tickets across orgs, mixed statuses/priorities

### Frontend Tasks
*None — backend-only milestone.*

### API Endpoints
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/tickets` | Yes | tenant-scoped, query params: `?status=&priority=&assignee_id=` |
| POST | `/api/tickets` | Yes | `subject, description, priority` (optional) |
| GET | `/api/tickets/{id}` | Yes | eager-loads requester + assignee |
| PUT | `/api/tickets/{id}` | Yes | `status, priority, assignee_id` (any subset) |

### Tests
- **Backend PHPUnit:**
  - `TicketIndexTest` — admin sees all org tickets; customer sees only own
  - `TicketStoreTest` — authenticated user can create; `requester_id` is auto-set
  - `TicketShowTest` — cannot view ticket from another org (404 or 403)
  - `TicketUpdateTest` — agent can change status; customer can update own but not another user’s
  - `TenantIsolationTest` — Org A ticket IDs are invisible to Org B users

### Suggested Git Commit
```
feat: ticket CRUD with tenant-scoped policies and filtering
```

---

## Milestone 1.4 — Dashboard Shell & Navigation
**Priority:** MUST  
**Estimated Effort:** 2–3 hours

### Goal
Authenticated users land on a dashboard with a persistent sidebar and top bar. The shell handles role-based navigation items and responsive layout.

### Database Schema
*None.*

### Backend Tasks
*None — frontend-only milestone.*

### Frontend Tasks
- Create `DashboardLayout` component:
  - Sidebar: logo, nav links (Tickets, maybe placeholder for Settings)
  - Top bar: user avatar + name, org name, logout button
  - Role-based link visibility (e.g., admin sees “Users” placeholder, customer sees only “My Tickets”)
- Create `DashboardPage` placeholder (summary cards: total tickets, open tickets, etc. — can be static/dummy for now)
- Create `NotFoundPage`
- Set up React Router with routes:
  - `/` → `DashboardPage`
  - `/tickets` → `TicketListPage`
  - `/tickets/new` → `TicketCreatePage`
  - `/tickets/:id` → `TicketDetailPage`
  - `/login` → `LoginPage`
  - `/register` → `RegisterPage`
- Wrap authenticated routes in `ProtectedRoute`
- Add `AuthProvider` at the root
- Add basic Tailwind styling for layout, spacing, and responsive sidebar collapse

### API Endpoints
*None new.*

### Tests
- Manual navigation: login → lands on `/dashboard`
- Sidebar links work; logout clears token and redirects to `/login`
- Direct URL to `/tickets` when unauthenticated → redirects to `/login`
- Mobile: sidebar collapses to hamburger

### Suggested Git Commit
```
feat: dashboard layout with sidebar, routing, and role-based nav
```

---

## Milestone 1.5 — Ticket Frontend (List / Create / Detail)
**Priority:** MUST  
**Estimated Effort:** 4–5 hours

### Goal
Users can create tickets, browse a paginated list, and view ticket details with status updates. This is the core user-facing value of the sprint.

### Database Schema
*Already created in Milestone 1.3.*

### Backend Tasks
- Ensure `/api/tickets` returns paginated JSON with `requester` and `assignee` included (or make them loadable via `?include=`)
- Ensure status update endpoint works (Milestone 1.3 already done)

### Frontend Tasks
- `TicketListPage`:
  - Table with columns: ID, Subject, Status, Priority, Requester, Assignee, Created
  - Filter controls: status dropdown, priority dropdown
  - Pagination component consuming Laravel’s `links` meta
  - “New Ticket” button
- `TicketCreatePage`:
  - Form: Subject, Description, Priority (select)
  - On submit → POST `/api/tickets` → redirect to `/tickets/{id}`
  - Loading state and error display
- `TicketDetailPage`:
  - Display ticket subject, description, status badge, priority badge, requester name, assignee name
  - Status update dropdown (for agents/admins; customers see read-only or limited options)
  - Assignee selector (for agents/admins)
  - “Back to list” link
- Add `useTickets` hook or `TicketsContext` for list state
- Add `useTicket(id)` hook for single-ticket fetching

### API Endpoints
*Uses endpoints from Milestones 1.2 and 1.3.*

### Tests
- **Backend:** Already tested in 1.3.
- **Frontend (manual):**
  - Create ticket → appears in list with correct status
  - Filter by status → only matching tickets shown
  - Navigate to detail → correct data rendered
  - Update status → badge changes, persists on refresh
  - Customer cannot see “Assignee” selector; agent can

### Suggested Git Commit
```
feat: ticket list, create, and detail views with filtering and pagination
```

---

## Milestone 1.6 — Comments (Public Replies + Internal Notes)
**Priority:** SHOULD  
**Estimated Effort:** 3–4 hours

### Goal
Any ticket can have a thread of comments. Agents see both public and internal (`is_internal=true`) comments. Customers see only public comments. The author is always the logged-in user.

### Database Schema
```sql
comments
  id                bigint unsigned PK
  ticket_id         bigint unsigned FK → tickets.id
  author_id         bigint unsigned FK → users.id
  body              text
  is_internal       boolean default false
  created_at        timestamp
  updated_at        timestamp
```

### Backend Tasks
- `Comment` model with `ticket()`, `author()` relations
- Global tenant scope (via `ticket_id` → `ticket.organization_id`) or enforce through `TicketPolicy`
- `CommentPolicy`:
  - `view` on ticket → customers see only `is_internal=false`; agents/admins see all
  - `create` → any authenticated user in the same org
- `CommentController`:
  - `index($ticket)` — scoped to ticket, filtered by visibility
  - `store($ticket)` — create comment, auto-set `author_id`
- Eager-load `author` on comment responses

### Frontend Tasks
- Add comment thread to `TicketDetailPage`:
  - Display list: author name, timestamp, body, “Internal” badge for agents
  - Comment form: textarea + “Post as internal note” checkbox (only visible to agents/admins)
  - On submit → append to thread without full page reload
- Hide internal comments entirely from customer view (filter on frontend or backend)

### API Endpoints
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/tickets/{id}/comments` | Yes | tenant + visibility scoped |
| POST | `/api/tickets/{id}/comments` | Yes | `body, is_internal` (bool) |

### Tests
- **Backend PHPUnit:**
  - `CommentIndexTest` — customer sees only public; agent sees internal too
  - `CommentStoreTest` — author auto-set; customer cannot set `is_internal=true` (ignored or 403)
  - `TenantIsolationTest` — cannot list comments on a ticket from another org
- **Frontend (manual):**
  - Post public comment → visible to all roles
  - Post internal note → visible to agent, hidden from customer
  - Customer detail page never renders internal comment cards

### Suggested Git Commit
```
feat: ticket comments with public replies and internal notes
```

---

## Milestone 1.7 — Activity Log (Audit Trail)
**Priority:** STRETCH  
**Estimated Effort:** 2–3 hours

### Goal
A simple append-only log records who changed what on a ticket. Displayed in the ticket detail page as a chronological timeline.

### Database Schema
```sql
activity_logs
  id                bigint unsigned PK
  ticket_id         bigint unsigned FK → tickets.id
  actor_id          bigint unsigned FK → users.id
  action            varchar(255)          -- e.g. "status_changed", "assigned", "commented"
  meta              json nullable         -- { old: "open", new: "pending" }
  created_at        timestamp
```

### Backend Tasks
- `ActivityLog` model + migration
- Observer or event-driven logging on `Ticket` updates and `Comment` creation
- `TicketController@show` eager-loads `activityLogs` with `actor`
- `ActivityLogController@index($ticket)` — tenant-scoped, chronological

### Frontend Tasks
- Add “Activity” tab or section on `TicketDetailPage`
- Render timeline: actor name, action, timestamp, diff if applicable

### API Endpoints
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/tickets/{id}/activity` | Yes | chronological, tenant-scoped |

### Tests
- **Backend PHPUnit:**
  - `ActivityLogTest` — updating status creates log entry; viewing includes actor
- **Frontend (manual):**
  - Change status → activity item appears in timeline

### Suggested Git Commit
```
feat: activity log for ticket changes and assignments
```

---

## Milestone 1.8 — SLA Policy Display (Backend Only)
**Priority:** STRETCH  
**Estimated Effort:** 2–3 hours

### Goal
Admins can configure SLA response/resolution targets per priority. These are stored and exposed via API but not enforced yet.

### Database Schema
```sql
sla_policies
  id                bigint unsigned PK
  organization_id   bigint unsigned FK → organizations.id
  priority          enum('low','medium','high','urgent')
  response_minutes  int unsigned
  resolution_minutes int unsigned
  created_at        timestamp
  updated_at        timestamp
```

### Backend Tasks
- `SlaPolicy` model + migration + factory
- `SlaPolicyController` — index, store, update, destroy (admin only)
- Seeder: default SLA policies for Acme org
- Include `sla_policy` in ticket detail response (optional, lightweight)

### Frontend Tasks
- `SlaSettingsPage` (admin only): table of priorities + response/resolution minutes
- Simple edit-in-place or modal form

### API Endpoints
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/sla-policies` | Admin | org-scoped |
| POST | `/api/sla-policies` | Admin | create |
| PUT | `/api/sla-policies/{id}` | Admin | update |

### Tests
- **Backend PHPUnit:**
  - `SlaPolicyCrudTest` — CRUD, tenant isolation, non-admin rejected
- **Frontend (manual):**
  - Admin sees SLA settings page; agent/customer cannot access route

### Suggested Git Commit
```
feat: SLA policy model and admin settings page
```

---

## Sprint 01 Outcome

### Shipped (MUST + SHOULD)
- [ ] Laravel 11 + React 19 + Vite + Tailwind + Sanctum bootstrapped and CI green
- [ ] Multi-tenant auth (org + user + roles) with demo seeders
- [ ] Ticket CRUD backend with tenant-scoped policies and filtering
- [ ] Dashboard shell with sidebar, routing, and role-based navigation
- [ ] Ticket list, create, and detail views (frontend)
- [ ] Comments (public + internal) on tickets

### Slipped / Moved to Sprint 02
- [ ] Activity log (STRETCH — can be Sprint 2 MUST)
- [ ] SLA policy (STRETCH — can be Sprint 2 SHOULD)
- [ ] Customer-specific ticket views (can be Sprint 2 polish)

### PRs
- `feat/bootstrap-and-auth` → merged to `main`
- `feat/ticket-crud-and-frontend` → merged to `main`
- `feat/comments` → merged to `main` (if completed)

### Definition of Done for Sprint 01
1. `php artisan migrate --seed` creates an org, three users, and sample tickets.
2. A user can log in via the React frontend and see their org’s tickets.
3. An agent can create a ticket, change its status, and post an internal note.
4. A customer can create a ticket and post a public reply but cannot see internal notes.
5. GitHub Actions CI is green on the latest `main`.

---

## Appendix — ERD (Sprint 01)

```
┌──────────────────┐       ┌──────────────────┐
│  organizations   │       │     users       │
├──────────────────┤       ├──────────────────┤
│ id (PK)          │◄──────┤ id (PK)          │
│ name             │       │ organization_id  │
│ slug             │       │ name             │
│ ...              │       │ email            │
└──────────────────┘       │ password        │
                           │ role            │
                           │ ...             │
                           └──────────────────┘
                                   │
                    ┌──────────────┘
                    ▼
           ┌──────────────────┐
           │    tickets       │
           ├──────────────────┤
           │ id (PK)          │
           │ organization_id  │
           │ subject          │
           │ description      │
           │ status           │
           │ priority         │
           │ requester_id ────┼──► users.id
           │ assignee_id ─────┼──► users.id (nullable)
           │ ...             │
           └──────────────────┘
                    │
                    ▼
           ┌──────────────────┐
           │    comments     │
           ├──────────────────┤
           │ id (PK)          │
           │ ticket_id (FK)  │
           │ author_id (FK)  │
           │ body            │
           │ is_internal     │
           │ ...             │
           └──────────────────┘
```
