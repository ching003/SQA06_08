# BE Jobs Connect

Backend API cho ứng dụng Jobs Connect - nền tảng kết nối việc làm, được xây dựng với kiến trúc Clean Architecture.

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Storage**: Firebase Storage
- **Authentication**: JWT
- **Validation**: Zod
- **DI Container**: Awilix

## Architecture

Dự án sử dụng **Modular Clean Architecture** (Package by Feature + Layered):

```
src/
├── app.ts                    # Express app configuration
├── server.ts                 # Server entry point
│
├── core/                     # Framework & Infrastructure
│   ├── container/            # Dependency Injection (Awilix)
│   ├── middleware/           # Auth, Error handling
│   └── routes/               # API routes aggregation
│
├── modules/                  # Feature Modules
│   ├── user/                 # User management
│   ├── company/              # Company management
│   ├── job/                  # Job postings
│   ├── cv/                   # CV/Resume management
│   ├── application/          # Job applications
│   └── notification/         # Notifications
│
└── shared/                   # Shared Kernel
    ├── constants/            # HTTP status codes, messages
    ├── domain/               # Shared errors, service interfaces
    └── infrastructure/       # Database, external services
```

### Module Structure

Mỗi module tuân theo Clean Architecture với 4 layers:

```
{module}/
├── domain/                   # Enterprise Business Rules
│   ├── entities/             # Domain entities
│   ├── enums/                # Domain enums
│   └── repositories/         # Repository interfaces (ports)
│
├── application/              # Application Business Rules
│   ├── dtos/                 # Data Transfer Objects
│   ├── use-cases/            # Business logic (interactors)
│   └── helpers/              # Mappers, utilities
│
├── infrastructure/           # Frameworks & Drivers
│   ├── mappers/              # Entity <-> Persistence mappers
│   └── repositories/         # Repository implementations (adapters)
│
└── interfaces/               # Interface Adapters
    ├── controllers/          # HTTP controllers
    ├── routes/               # Express routes
    └── validators/           # Zod validation schemas
```

## Features

### User Module
- Authentication (Register, Login, JWT)
- Profile management
- Avatar upload
- Admin: User CRUD, Lock/Unlock

### Company Module
- Company registration & approval
- Company profile management
- Member management & invitations
- Logo/Banner upload

### Job Module
- Job posting CRUD
- Job search & filtering
- Save/Unsave jobs
- Similar jobs recommendation

### CV Module
- CV CRUD with multiple templates
- CV export to PDF
- Save CVs (for recruiters)
- Open for job status

### Application Module
- Apply for jobs
- Application status tracking
- Withdraw applications

### Notification Module
- Real-time notifications
- Mark as read
- Notification preferences

## Getting Started

### Prerequisites

- Node.js >= 18.x
- PostgreSQL
- Firebase project (Storage enabled)

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate
```

### Environment Setup

```bash
# Copy environment template
cp env.example .env
```

Cấu hình các biến môi trường:

```env
# Database
DATABASE_URL="postgresql://postgres:1234@localhost:5432/jobsconnect"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Firebase Admin SDK
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="your-client-email"
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_DATABASE_URL="https://your-project.firebaseio.com"
FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
```

### Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE jobsconnect;"

# Run migrations
npm run prisma:migrate

# (Optional) Seed data
npm run prisma:seed

# (Optional) Open Prisma Studio
npm run prisma:studio
```

### Run Application

```bash
# Development (with hot reload)
npm run dev

# Production
npm start

# Type check
npm run typecheck
```

Server chạy tại: `http://localhost:4000`

## API Endpoints

### Health Check
```
GET /health
```

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Users
```
GET    /api/users
GET    /api/users/:id
GET    /api/users/me
PUT    /api/users/me
PUT    /api/users/me/password
POST   /api/users/me/avatar
```

### Companies
```
GET    /api/companies
GET    /api/companies/:id
POST   /api/companies
PUT    /api/companies/:id
DELETE /api/companies/:id
```

### Jobs
```
GET    /api/jobs
GET    /api/jobs/:id
POST   /api/jobs
PUT    /api/jobs/:id
DELETE /api/jobs/:id
GET    /api/jobs/:id/similar
POST   /api/jobs/:id/save
DELETE /api/jobs/:id/save
```

### CVs
```
GET    /api/cvs
GET    /api/cvs/:id
POST   /api/cvs
PUT    /api/cvs/:id
DELETE /api/cvs/:id
GET    /api/cvs/:id/export
```

### Applications
```
GET    /api/applications
GET    /api/applications/:id
POST   /api/jobs/:id/apply
PUT    /api/applications/:id/status
DELETE /api/applications/:id
```

### Notifications
```
GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
DELETE /api/notifications/:id
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm start` | Start production server |
| `npm run build` | Build TypeScript |
| `npm run typecheck` | Type checking |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed database |

## Path Aliases

```typescript
@modules/*   -> src/modules/*
@shared/*    -> src/shared/*
@core/*      -> src/core/*
```

## License

ISC
