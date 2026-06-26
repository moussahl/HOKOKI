# HOKOKI — Backend API

Civic legal rights platform built for the NCS Hackathon. Gives Algerian citizens a single place to browse laws, follow administrative procedures step-by-step, chat with an AI legal assistant, and book consultations with verified legal experts.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Running the App](#running-the-app)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [API Reference](#api-reference)
  - [Auth](#auth----apiauth)
  - [Laws](#laws----apilaws)
  - [Procedures](#procedures----apiprocedures)
  - [Conversations](#conversations----apiconversations)
  - [Expert Sessions](#expert-sessions----apiexpert-sessions)
  - [Interests](#interests----apiinterests)
  - [Notifications](#notifications----apinotifications)
  - [Uploads](#uploads----apiuploads)
- [User Roles](#user-roles)
- [Pagination](#pagination)
- [Rate Limiting](#rate-limiting)
- [Testing](#testing)
- [Scripts Reference](#scripts-reference)

---

## Features

| Feature | Status | Details |
|---|---|---|
| JWT Authentication | Done | Register, login, profile — bcrypt password hashing |
| Laws browser | Done | Browse, filter, search full-text across articles |
| Procedures tracker | Done | Step-by-step guides with per-user progress tracking |
| AI Conversations | Done | Persistent chat sessions with message history |
| Expert Sessions | Done | Book consultations with verified legal experts |
| User Interests | Done | Tag-based personalisation |
| Notifications | Done | In-app notification feed with read/unread state |
| File Upload | Done | PDF / image upload for document checker feature |
| Swagger Docs | Done | Auto-generated OpenAPI docs at `/api/docs` |
| Rate Limiting | Done | 10 req/sec burst, 200 req/min sustained (global) |
| Pagination | Done | Consistent `page` / `limit` on all list endpoints |
| Unit Tests | Done | AuthService + LawsService — 12 tests, no DB needed |
| E2E Tests | Done | Auth endpoints tested with mocked repository |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | NestJS 11 (TypeScript) |
| Database | PostgreSQL |
| ORM | TypeORM 0.3 |
| Authentication | passport-jwt + bcrypt |
| Validation | class-validator / class-transformer |
| File Uploads | Multer (disk storage) |
| Rate Limiting | @nestjs/throttler |
| API Docs | @nestjs/swagger / swagger-ui-express |
| Testing | Jest 30 + Supertest |

---

## Project Structure

```
HOKOKI/
├── src/
│   ├── main.ts                        # App bootstrap: global prefix, pipes, Swagger
│   ├── app.module.ts                  # Root module: TypeORM, Throttler, feature modules
│   │
│   ├── common/
│   │   └── dto/
│   │       ├── pagination-query.dto.ts      # Shared page/limit base DTO
│   │       └── paginated-response.dto.ts    # PaginatedResponseDto<T> + buildMeta helper
│   │
│   ├── auth/
│   │   ├── auth.controller.ts         # POST /register, POST /login, GET /me
│   │   ├── auth.service.ts            # register(), login() business logic
│   │   ├── auth.module.ts
│   │   ├── auth.service.spec.ts       # Unit tests (5 tests)
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts        # passport-jwt strategy
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts      # @UseGuards(JwtAuthGuard)
│   │   │   └── roles.guard.ts         # @UseGuards(RolesGuard) + @Roles(...)
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts   # @CurrentUser()
│   │   │   └── roles.decorator.ts          # @Roles(UserRole.ADMIN)
│   │   └── dto/
│   │       ├── register.dto.ts
│   │       ├── login.dto.ts
│   │       └── auth-response.dto.ts
│   │
│   ├── users/
│   │   ├── users.service.ts           # findByEmail, findById, create
│   │   ├── users.module.ts
│   │   └── dto/
│   │       └── user-response.dto.ts
│   │
│   ├── laws/
│   │   ├── laws.controller.ts         # CRUD + article search
│   │   ├── laws.service.ts
│   │   ├── laws.module.ts
│   │   ├── laws.service.spec.ts       # Unit tests (7 tests)
│   │   └── dto/
│   │       ├── list-laws-query.dto.ts        # extends PaginationQueryDto
│   │       ├── search-articles-query.dto.ts  # extends PaginationQueryDto
│   │       ├── law-response.dto.ts
│   │       └── law-article-response.dto.ts
│   │
│   ├── procedures/
│   │   ├── procedures.controller.ts   # CRUD + steps + progress tracking
│   │   ├── procedures.service.ts
│   │   ├── procedures.module.ts
│   │   └── dto/  (create/update/response for procedure, step, progress)
│   │
│   ├── conversations/
│   │   ├── conversations.controller.ts  # CRUD + messages
│   │   ├── conversations.service.ts
│   │   ├── conversations.module.ts
│   │   └── dto/  (create/update/response for conversation + message)
│   │
│   ├── expert-sessions/
│   │   ├── expert-sessions.controller.ts  # booking + expert assignment
│   │   ├── expert-sessions.service.ts
│   │   ├── expert-sessions.module.ts
│   │   └── dto/  (create/update/response)
│   │
│   ├── interests/
│   │   ├── interests.controller.ts
│   │   ├── interests.service.ts
│   │   ├── interests.module.ts
│   │   └── dto/
│   │
│   ├── notifications/
│   │   ├── notifications.controller.ts
│   │   ├── notifications.service.ts
│   │   ├── notifications.module.ts
│   │   └── dto/
│   │
│   ├── uploads/
│   │   ├── uploads.controller.ts      # POST /uploads/document (Multer)
│   │   └── uploads.module.ts
│   │
│   └── database/
│       ├── data-source.ts             # TypeORM DataSource for CLI
│       ├── entities/
│       │   ├── user.entity.ts
│       │   ├── law.entity.ts
│       │   ├── law-article.entity.ts
│       │   ├── procedure.entity.ts
│       │   ├── procedure-step.entity.ts
│       │   ├── procedure-progress.entity.ts
│       │   ├── conversation.entity.ts
│       │   ├── message.entity.ts
│       │   ├── expert-session.entity.ts
│       │   ├── user-interest.entity.ts
│       │   └── notification.entity.ts
│       ├── migrations/
│       │   └── 1782483752053-InitSchema.ts
│       └── seeds/
│           └── seed.ts
│
├── test/
│   └── auth.e2e-spec.ts               # E2E tests for auth endpoints
│
├── uploads/                           # Runtime upload folder (gitignored)
├── .env                               # Environment variables (gitignored)
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Installation

### 1. Clone the repository

```bash
git clone <repo-url>
cd HOKOKI
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your `.env` file

```bash
cp .env.example .env
```

Then edit `.env` — see [Environment Variables](#environment-variables) below.

### 4. Create the PostgreSQL database

```sql
CREATE DATABASE hokoki;
```

### 5. Run migrations

```bash
npm run migration:run
```

### 6. (Optional) Seed the database

```bash
npm run seed
```

### 7. Start the server

```bash
npm run start:dev
```

The API is now running at `http://localhost:3000/api`.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | Port the HTTP server listens on |
| `DB_HOST` | Yes | `localhost` | PostgreSQL host |
| `DB_PORT` | Yes | `5432` | PostgreSQL port |
| `DB_USERNAME` | Yes | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | Yes | — | PostgreSQL password |
| `DB_NAME` | Yes | `hokoki` | PostgreSQL database name |
| `DB_SYNCHRONIZE` | No | `false` | Auto-sync schema (use `true` only in dev, never in production) |
| `JWT_SECRET` | Yes | — | Secret key used to sign JWT tokens |
| `NODE_ENV` | No | `development` | Environment name |

Example `.env`:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=hokoki
DB_SYNCHRONIZE=false
JWT_SECRET=super-secret-key-change-in-prod
```

---

## Database

### Entities & Tables

| Entity | Table | Description |
|---|---|---|
| `User` | `users` | Platform users (citizen / expert / admin) |
| `Law` | `laws` | Legal codes (labour, civil, commercial, etc.) |
| `LawArticle` | `law_articles` | Individual numbered articles within a law |
| `Procedure` | `procedures` | Administrative procedure definitions |
| `ProcedureStep` | `procedure_steps` | Ordered steps within a procedure |
| `ProcedureProgress` | `procedure_progress` | Per-user procedure tracking state |
| `Conversation` | `conversations` | AI chat sessions |
| `Message` | `messages` | Individual messages in a conversation |
| `ExpertSession` | `expert_sessions` | Consultation booking (citizen ↔ expert) |
| `UserInterest` | `user_interests` | User interest / topic tags |
| `Notification` | `notifications` | In-app notification records |

### Migration Commands

```bash
# Apply all pending migrations
npm run migration:run

# Roll back the last migration
npm run migration:revert

# Auto-generate a migration from entity changes
npm run migration:generate

# Create an empty migration file
npm run migration:create
```

---

## Running the App

```bash
# Development — hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Production (compile first)
npm run build
npm run start:prod
```

---

## API Documentation (Swagger)

Once the server is running, open:

```
http://localhost:3000/api/docs
```

The interactive Swagger UI lists every endpoint with request/response schemas. Click **Authorize** and paste your JWT token to test protected routes directly in the browser.

---

## API Reference

All routes share the prefix `/api`. Protected routes require the header:

```
Authorization: Bearer <your-jwt-token>
```

---

### Auth — `/api/auth`

#### `POST /api/auth/register`

Register a new user account. Returns a JWT token immediately.

**Request body:**
```json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "password123"
}
```

**Response `201`:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a1b2c3d4-...",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "citizen",
    "preferredLanguage": "ar",
    "isVerifiedExpert": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Errors:** `400` invalid body — `409` email already registered

---

#### `POST /api/auth/login`

Login with existing credentials.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response `200`:** same shape as register.

**Errors:** `400` invalid body — `401` wrong email or password

---

#### `GET /api/auth/me` — JWT required

Returns the currently authenticated user's profile.

**Response `200`:**
```json
{
  "id": "a1b2c3d4-...",
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "citizen",
  "preferredLanguage": "ar",
  "isVerifiedExpert": false,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Errors:** `401` missing or invalid token

---

### Laws — `/api/laws`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/laws` | Public | List laws with optional filters |
| GET | `/laws/:id` | Public | Get a law by UUID |
| GET | `/laws/:id/articles` | Public | Get all articles for a law |
| GET | `/laws/articles/search` | Public | Full-text search across all articles |
| GET | `/laws/articles/:id` | Public | Get a single article by UUID |
| POST | `/laws` | Admin | Create a new law |
| PATCH | `/laws/:id` | Admin | Update an existing law |
| DELETE | `/laws/:id` | Admin | Delete a law |

#### `GET /api/laws` — Query params

| Param | Type | Description |
|---|---|---|
| `category` | string | Filter by category (e.g. `labor`, `civil`) |
| `language` | string | Filter by language (`ar`, `fr`) |
| `page` | number | Page number (default `1`) |
| `limit` | number | Items per page (default `20`, max `100`) |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Code du travail",
      "category": "labor",
      "language": "ar",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

#### `GET /api/laws/articles/search` — Query params

| Param | Type | Required | Description |
|---|---|---|---|
| `q` | string | Yes | Search term |
| `page` | number | No | Page number (default `1`) |
| `limit` | number | No | Items per page (default `20`, max `100`) |

---

### Procedures — `/api/procedures`

Step-by-step administrative procedure guides (passport renewal, driving licence, etc.)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/procedures` | Public | List all procedures |
| GET | `/procedures/:key` | Public | Get a procedure by its unique key |
| POST | `/procedures` | Admin | Create a procedure |
| PATCH | `/procedures/:id` | Admin | Update a procedure |
| DELETE | `/procedures/:id` | Admin | Delete a procedure |
| POST | `/procedures/:id/steps` | Admin | Add a step to a procedure |
| PATCH | `/procedures/steps/:stepId` | Admin | Update a step |
| DELETE | `/procedures/steps/:stepId` | Admin | Delete a step |
| POST | `/procedures/:id/start` | JWT | Start tracking a procedure |
| GET | `/procedures/progress/all` | JWT | Get all of current user's progress records |
| PATCH | `/procedures/progress/:progressId` | JWT | Update progress (mark a step complete) |

#### `POST /api/procedures/:id/start`

Creates a progress record for the authenticated user on the given procedure.

#### `PATCH /api/procedures/progress/:progressId`

**Request body:**
```json
{ "completedStepIds": ["step-uuid-1", "step-uuid-2"] }
```

---

### Conversations — `/api/conversations`

Persistent chat sessions used by the AI legal assistant. All endpoints require JWT.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/conversations` | Create a new conversation |
| GET | `/conversations` | List current user's conversations (paginated) |
| GET | `/conversations/:id` | Get a conversation by ID |
| PATCH | `/conversations/:id` | Update a conversation (e.g. rename) |
| DELETE | `/conversations/:id` | Delete a conversation |
| POST | `/conversations/:id/messages` | Append a message to a conversation |
| GET | `/conversations/:id/messages` | Get messages in a conversation (paginated) |

#### `POST /api/conversations`

**Request body:**
```json
{ "title": "Question about labour law" }
```

#### `POST /api/conversations/:id/messages`

**Request body:**
```json
{ "role": "user", "content": "What are my rights as an employee?" }
```

#### Pagination

All list endpoints accept `?page=1&limit=20`.

---

### Expert Sessions — `/api/expert-sessions`

Citizens request consultations with verified legal experts. All endpoints require JWT.

| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/expert-sessions` | JWT | Request a new expert session |
| GET | `/expert-sessions` | JWT | List your sessions |
| GET | `/expert-sessions/:id` | JWT | Get a session by ID |
| PATCH | `/expert-sessions/:id` | JWT | Update session details |
| POST | `/expert-sessions/:id/assign` | Admin | Assign a verified expert to a session |
| GET | `/expert-sessions/experts/available` | JWT | List available verified experts |

#### `POST /api/expert-sessions`

**Request body:**
```json
{
  "topic": "Labour contract dispute",
  "description": "My employer has not paid my salary for 3 months.",
  "scheduledAt": "2025-06-30T10:00:00.000Z"
}
```

#### `POST /api/expert-sessions/:id/assign` — Admin only

**Request body:**
```json
{ "expertId": "expert-user-uuid" }
```

---

### Interests — `/api/interests`

User interest tags that drive personalised law and procedure recommendations. All endpoints require JWT.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/interests` | List current user's interests |
| POST | `/interests` | Add a new interest |
| PATCH | `/interests/:id` | Update an interest |
| DELETE | `/interests/:id` | Remove an interest |

#### `POST /api/interests`

**Request body:**
```json
{ "tag": "labor-law" }
```

---

### Notifications — `/api/notifications`

In-app notification feed. All endpoints require JWT.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | List current user's notifications (paginated) |
| PATCH | `/notifications/:id/read` | Mark a notification as read |

#### `GET /api/notifications` — Query params

| Param | Default | Description |
|---|---|---|
| `page` | 1 | Page number |
| `limit` | 20 | Items per page (max 100) |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Your expert session has been confirmed",
      "body": "Your session on 30 June at 10:00 is confirmed.",
      "isRead": false,
      "createdAt": "2025-06-01T12:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---

### Uploads — `/api/uploads`

File upload endpoint for the document checker feature. Requires JWT.

#### `POST /api/uploads/document`

Upload a legal document for AI analysis.

- **Content-Type:** `multipart/form-data`
- **Field name:** `file`
- **Accepted types:** `application/pdf`, `image/jpeg`, `image/png`, `image/webp`
- **Max size:** 10 MB

**Response `201`:**
```json
{
  "filename": "3f2a1b4c-uuid-generated-name.pdf",
  "originalName": "my-contract.pdf",
  "size": 204800,
  "mimetype": "application/pdf"
}
```

Files are stored in `./uploads/` on disk (excluded from git). The returned `filename` can be passed to the AI document-checker service.

**Errors:** `400` no file / wrong file type — `401` not authenticated

---

## User Roles

| Role | Value | Permissions |
|---|---|---|
| Citizen | `citizen` | Default. Browse laws, track procedures, chat with AI, book expert sessions |
| Expert | `expert` | All citizen permissions. Can be assigned to expert sessions |
| Admin | `admin` | Full access. Create/update/delete laws, procedures, sessions. Assign experts |

The role is stored in the JWT payload and enforced by `RolesGuard` + `@Roles(UserRole.ADMIN)` decorators.

---

## Pagination

Every list endpoint that supports pagination uses the shared `PaginationQueryDto`:

| Query Param | Type | Default | Max | Description |
|---|---|---|---|---|
| `page` | integer | `1` | — | 1-indexed page number |
| `limit` | integer | `20` | `100` | Items per page |

All paginated responses return the same envelope:

```json
{
  "data": [ ...items ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 87,
    "totalPages": 5
  }
}
```

---

## Rate Limiting

A global `ThrottlerGuard` is applied to every route:

| Window | Limit |
|---|---|
| 1 second | 10 requests |
| 1 minute | 200 requests |

When the limit is exceeded the API responds with `429 Too Many Requests`.

---

## Testing

### Unit tests (no database required)

```bash
npm run test
```

| File | Tests | Covers |
|---|---|---|
| `src/auth/auth.service.spec.ts` | 5 | `register` (success, duplicate email), `login` (success, user not found, wrong password) |
| `src/laws/laws.service.spec.ts` | 7 | `list` (paginated, defaults), `getById` (found, not found), `searchArticles`, `deleteLaw` (not found, success) |

### Unit tests with coverage

```bash
npm run test:cov
```

Coverage report is generated in `./coverage/`.

### E2E tests (no database required — mocked repo)

```bash
npm run test:e2e
```

| File | Tests | Covers |
|---|---|---|
| `test/auth.e2e-spec.ts` | 6 | `POST /api/auth/register` (400, 201, 409), `POST /api/auth/login` (400, 401), `GET /api/auth/me` (401) |

---

## Scripts Reference

| Script | Command | Description |
|---|---|---|
| Start (dev) | `npm run start:dev` | Watch mode with hot reload |
| Start (prod) | `npm run start:prod` | Run compiled `dist/main.js` |
| Build | `npm run build` | Compile TypeScript → `dist/` |
| Test | `npm run test` | Run all unit tests |
| Test coverage | `npm run test:cov` | Run tests + generate coverage report |
| Test e2e | `npm run test:e2e` | Run e2e test suite |
| Lint | `npm run lint` | ESLint with auto-fix |
| Format | `npm run format` | Prettier formatting |
| Migration run | `npm run migration:run` | Apply all pending migrations |
| Migration revert | `npm run migration:revert` | Roll back last migration |
| Migration generate | `npm run migration:generate` | Generate migration from entity diff |
| Migration create | `npm run migration:create` | Create a blank migration file |
| Seed | `npm run seed` | Seed initial data into the database |
