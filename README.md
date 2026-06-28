# Auth API

A production-grade authentication REST API built with NestJS and MongoDB. Supports user signup, signin with password or PIN, JWT-protected routes, account lockout, and rate limiting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | NestJS |
| Database | MongoDB (Mongoose) |
| Authentication | Passport.js, JWT |
| Validation | class-validator, class-transformer |
| Config | @nestjs/config, Joi |
| Security | Helmet, @nestjs/throttler |
| Docs | Swagger/OpenAPI |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB instance (local or Atlas)

### Installation

```bash
git clone https://github.com/Willy0la/auth-api.git
cd auth-api
npm install
```

### Environment Variables

Create a `.env.development.local` file in the root directory:

```env
NODE_ENV=development
PORT=5000
DB=your_mongodb_connection_string
SECRET=your_jwt_secret
TTL=7d
CLIENT_URL=http://localhost:3000
THROTTLE_TTL=60000
THROTTLE_LIMIT=5
```

### Running the App

```bash
# development
npm run start:dev

# production
npm run start:prod
```

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/user/register` | Create a new user account | None |
| POST | `/user/login` | Login with password or PIN | None |
| GET | `/user/:id` | Get user profile by ID | Required |

Swagger docs available at `http://localhost:5000/api` in development.

---

## Key Design Decisions

**Account Lockout + Rate Limiting**
Two independent layers protect the login endpoint. Rate limiting blocks excessive requests per IP  3 attempts per minute. Account lockout blocks a specific account after 5 failed attempts for 15 minutes. They solve different attack vectors  rate limiting stops volume attacks, account lockout stops targeted credential attacks.

**Atomic Transactions**
User creation uses MongoDB sessions via `withTransaction` —if any operation fails, everything rolls back. No orphan documents.

**Custom Validator — AtLeastOneOf**
A custom class-validator decorator enforces that either password or PIN must be present on login. Business rule enforced at the DTO level before the request reaches the service.

**Helmet**
Adds security HTTP headers to every response  protecting against XSS, clickjacking, and other common attacks. CSP configured to allow Swagger UI assets from jsdelivr.

**CORS**
Configured via `CLIENT_URL` environment variable  no code changes needed when switching environments.

**Swagger**
Disabled in production to avoid exposing API structure. Available only in development at `/api`.

**Pre-save Hook**
Schema-level hook keeps `isActive` and `deletedAt` in sync automatically. Also clears expired account locks on every `.save()` call — no cron job needed.

---

## Planned Improvements

- Jest unit and E2E tests
- BullMQ queue for async operations (welcome email, notifications)
- Password reset flow with Nodemailer
- Docker + docker-compose
- Refresh token support