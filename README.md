# Skillbase

A modular, scalable e-learning platform built with NestJS microservices architecture. Skillbase enables instructors to create and publish courses while allowing learners to track their progress through an intuitive learning experience.

## 🏗️ Architecture

Skillbase follows a **Microservices Architecture** pattern, demonstrating:
- **Polyglot Persistence**: SQL (PostgreSQL) and NoSQL (MongoDB) databases
- **Asynchronous Communication**: RabbitMQ for event-driven architecture
- **API Gateway Pattern**: Single entry point for all client requests
- **Caching**: Redis for high-performance data caching
- **Search**: Meilisearch for fast, powerful course search capabilities

### Technology Stack

- **Framework**: NestJS (TypeScript)
- **Databases**: PostgreSQL (SQL), MongoDB (NoSQL)
- **Message Broker**: RabbitMQ
- **Cache**: Redis
- **Search Engine**: Meilisearch
- **Package Manager**: pnpm
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
skillbase/
├── apps/                    # Microservices
│   ├── api-gateway/        # API Gateway service
│   └── identity-service/   # Authentication & authorization
├── libs/                    # Shared libraries
│   └── shared/             # Common utilities, DTOs, interfaces
├── docker-compose.yaml     # Infrastructure services
├── package.json            # Monorepo configuration
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (v10.14.0 or higher)
- Docker & Docker Compose

### Installation

1. Clone the repository:
```bash
git clone github.com/https-404/skillbase.git
cd skillbase
```

2. Install dependencies:
```bash
pnpm install
```

3. Start infrastructure services (databases, message broker, cache, search):
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port `5432`
- MongoDB on port `27017`
- RabbitMQ on ports `5672` (AMQP) and `15672` (Management UI)
- Redis on port `6379`
- Meilisearch on port `7700`
- MinIO on ports `9000` (S3 API) and `9001` (Web UI)

### Running the Application

#### Development Mode

Start all services in watch mode (recommended):
```bash
pnpm run start:all
```

This will start all services concurrently:
- API Gateway on port `3000`
- Identity Service on port `3001`
- Course Service on port `3002`
- Media Service on port `3003`
- Progress Service on port `3004`
- Reviews Service on port `3005`
- Indexer Service on port `3006`

Start a specific service:
```bash
pnpm run start:api-gateway      # Port 3000
pnpm run start:identity-service # Port 3001
pnpm run start:course-service   # Port 3002
pnpm run start:media-service     # Port 3003
pnpm run start:progress-service  # Port 3004
pnpm run start:reviews-service  # Port 3005
pnpm run start:indexer-service   # Port 3006
```

Or use the default (starts API Gateway only):
```bash
pnpm run start:dev
```

#### Production Mode

Build the project:
```bash
pnpm run build
```

Start in production:
```bash
pnpm run start:prod
```

## 🧪 Testing

Run unit tests:
```bash
pnpm run test
```

Run tests in watch mode:
```bash
pnpm run test:watch
```

Run tests with coverage:
```bash
pnpm run test:cov
```

Run e2e tests:
```bash
pnpm run test:e2e
```

## 📦 Services

### API Gateway
- **Default Port:** `3000`
- Entry point for all client requests
- Authentication validation
- Request routing to microservices
- Rate limiting and caching (Redis)
- **Environment Variable:** `APIGATEWAY_PORT`

### Identity Service
- **Default Port:** `3001`
- User registration and authentication
- JWT token generation
- User role management (Learner/Instructor)
- Database: PostgreSQL
- **Environment Variable:** `IDENTITYSERVICE_PORT`

### Course Service
- **Default Port:** `3002`
- Course creation and management
- Lesson structure
- Category/Tag management
- Database: PostgreSQL
- **Environment Variable:** `COURSESERVICE_PORT`

### Media Service
- **Default Port:** `3003`
- Handles video/document uploads
- Stores file metadata
- Integrates with MinIO (S3-compatible storage)
- Database: MongoDB
- **Environment Variable:** `MEDIASERVICE_PORT`

### Progress Service
- **Default Port:** `3004`
- Tracks user learning progress
- Watch time, completed lessons, quizzes
- Emits `lesson_completed` events to RabbitMQ
- Database: MongoDB
- **Environment Variable:** `PROGRESSSERVICE_PORT`

### Reviews Service
- **Default Port:** `3005`
- Course reviews and ratings
- Comment submission
- Average rating calculation
- Database: PostgreSQL
- **Environment Variable:** `REVIEWSSERVICE_PORT`

### Indexer Service
- **Default Port:** `3006`
- Listens for course/review events via RabbitMQ
- Updates search index in Meilisearch
- Enables fast course search
- **Environment Variable:** `INDEXERSERVICE_PORT`

## 🔧 Development

### Code Formatting

Format code:
```bash
pnpm run format
```

### Linting

Lint and fix issues:
```bash
pnpm run lint
```

### Environment Variables

Each service may require environment variables. Create `.env` files in respective service directories as needed.

## 🐳 Docker Services

The `docker-compose.yaml` file defines the following infrastructure:

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | SQL database for structured data |
| MongoDB | 27017 | NoSQL database for flexible schemas |
| RabbitMQ | 5672, 15672 | Message broker (AMQP + Management UI) |
| Redis | 6379 | In-memory cache |
| Meilisearch | 7700 | Search engine |
| MinIO | 9000, 9001 | S3-compatible object storage (API + Web UI) |

### Accessing Services

**RabbitMQ Management UI:** http://localhost:15672
- Username: `skillbaseadmin`
- Password: `password123`

**MinIO Web UI:** http://localhost:9001
- Username: `minioadmin`
- Password: `minioadmin123`
- Bucket: `skillbase-media` (auto-created)

## 📝 License

This project is [UNLICENSED](LICENSE).

## 👤 Author

https-404
