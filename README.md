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
- Authentication validation via Identity Service
- Request routing to microservices
- Rate limiting and caching via Redis (`caching-service:6379`)
- **Environment Variable:** `APIGATEWAY_PORT`

### Identity Service
- **Default Port:** `3001`
- User registration and authentication
- JWT token generation
- User role management (Learner/Instructor)
- Database: PostgreSQL (`identity_db` on `db-sql:5432`)
- **Environment Variable:** `IDENTITYSERVICE_PORT`

### Course Service
- **Default Port:** `3002`
- Course creation and management
- Lesson structure
- Category/Tag management
- Database: PostgreSQL (`course_db` on `db-sql:5432`)
- Emits: `course.published` event
- **Environment Variable:** `COURSESERVICE_PORT`

### Media Service
- **Default Port:** `3003`
- Handles video/document uploads
- Stores file metadata in MongoDB
- Integrates with MinIO (`minio:9000`) for object storage
- Database: MongoDB (`media_db` on `db-nosql:27017`)
- **Environment Variable:** `MEDIASERVICE_PORT`

### Progress Service
- **Default Port:** `3004`
- Tracks user learning progress
- Watch time, completed lessons, quizzes
- Emits: `lesson.completed` event to RabbitMQ
- Database: MongoDB (`progress_db` on `db-nosql:27017`)
- **Environment Variable:** `PROGRESSSERVICE_PORT`

### Reviews Service
- **Default Port:** `3005`
- Course reviews and ratings
- Comment submission
- Average rating calculation
- Database: PostgreSQL (`reviews_db` on `db-sql:5432`)
- Emits: `review.created` event
- **Environment Variable:** `REVIEWSSERVICE_PORT`

### Indexer Service
- **Default Port:** `3006`
- Listens for course/review events via RabbitMQ (`message-broker:5672`)
- Updates search index in Meilisearch (`search-engine:7700`)
- Indexes: `courses`, `reviews`
- Enables fast course search
- **Environment Variable:** `INDEXERSERVICE_PORT`

## 🔌 Service Communication & Routing

### Standardized Ports

| Service | Port | Internal URL (Docker) | External URL (Host) |
|---------|------|----------------------|---------------------|
| api-gateway | 3000 | http://api-gateway:3000 | http://localhost:3000 |
| identity-service | 3001 | http://identity-service:3001 | http://localhost:3001 |
| course-service | 3002 | http://course-service:3002 | http://localhost:3002 |
| media-service | 3003 | http://media-service:3003 | http://localhost:3003 |
| progress-service | 3004 | http://progress-service:3004 | http://localhost:3004 |
| reviews-service | 3005 | http://reviews-service:3005 | http://localhost:3005 |
| indexer-service | 3006 | http://indexer-service:3006 | http://localhost:3006 |

### API Gateway Routing

All client requests go through the API Gateway (`http://localhost:3000`). The Gateway routes to backend services:

| Client Path | Routes To | Service URL |
|-------------|-----------|-------------|
| `/auth/*` | Identity Service | http://identity-service:3001 |
| `/courses/*` | Course Service | http://course-service:3002 |
| `/media/*` | Media Service | http://media-service:3003 |
| `/progress/*` | Progress Service | http://progress-service:3004 |
| `/reviews/*` | Reviews Service | http://reviews-service:3005 |

**Note:** Services communicate internally using Docker service names (e.g., `http://identity-service:3001`). Clients only interact with the API Gateway.

## 🗄️ Database Structure

### PostgreSQL (db-sql:5432)

Single PostgreSQL container hosting multiple logical databases:

- **`identity_db`** - Identity Service (users, roles, authentication)
- **`course_db`** - Course Service (courses, lessons, categories)
- **`reviews_db`** - Reviews Service (reviews, ratings, comments)

**Connection:** Services connect to `db-sql:5432` and specify their database name.

### MongoDB (db-nosql:27017)

Single MongoDB container hosting multiple logical databases:

- **`media_db`** - Media Service (file metadata, uploads)
- **`progress_db`** - Progress Service (user progress, watch time, completions)

**Connection:** Services connect to `db-nosql:27017` and specify their database name.

## 🔄 Communication Patterns

### Synchronous Communication (HTTP)

**Use HTTP for all synchronous, request/response operations:**

- Client requests through API Gateway
- Service-to-service direct calls requiring immediate response
- Authentication/authorization validation
- Data fetching and CRUD operations
- Any operation where the caller needs an immediate result

**Implementation:**
- Use `@nestjs/axios` HttpService or NestJS HTTP clients
- API Gateway routes requests via HTTP to microservices
- Services communicate via HTTP when immediate response is required

**Example:**
```typescript
// API Gateway → Identity Service (HTTP)
const response = await this.httpService.get('http://identity-service:3001/auth/validate');
```

### Asynchronous Communication (RabbitMQ)

**Use RabbitMQ for all asynchronous, event-driven operations:**

- Event publishing and subscribing
- Decoupled service communication
- Background processing
- Fire-and-forget operations
- Notifications and side effects

**Implementation:**
- Use `@nestjs/microservices` with RabbitMQ transport
- Publish events to `skillbase.events` exchange
- Subscribe to events using routing keys

**Example:**
```typescript
// Course Service publishes event (RabbitMQ)
this.client.emit('course.published', { courseId: '123' });

// Indexer Service consumes event (RabbitMQ)
@EventPattern('course.published')
async handleCoursePublished(data: { courseId: string }) {
  // Update search index
}
```

### Communication Rules

**CRITICAL:**
- ✅ **HTTP** for synchronous request/response patterns
- ✅ **RabbitMQ** for asynchronous event-driven patterns
- ❌ **DO NOT** use HTTP for async operations
- ❌ **DO NOT** use RabbitMQ for synchronous requests

## 📨 RabbitMQ Event System

### Configuration

- **Hostname:** `message-broker`
- **AMQP Port:** `5672`
- **Management UI:** http://localhost:15672

### Exchange and Routing

- **Exchange Name:** `skillbase.events` (topic exchange)
- **Routing Key Format:** `dot.case` (lowercase, dot-separated)

### Core Events

| Event | Routing Key | Publisher | Consumers |
|-------|-------------|-----------|-----------|
| Course Published | `course.published` | Course Service | Indexer Service |
| Lesson Completed | `lesson.completed` | Progress Service | Course Service, Reviews Service |
| Review Created | `review.created` | Reviews Service | Indexer Service, Course Service |

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

Copy `.env.example` to `.env` and configure as needed:

```bash
cp .env.example .env
```

The `.env.example` file includes all standardized configuration:
- Service ports (3000-3006)
- Database connection strings (PostgreSQL & MongoDB)
- Redis, RabbitMQ, Meilisearch, and MinIO configuration
- JWT settings
- Internal service URLs

**Important:** Update `JWT_SECRET` in production with a secure random string.

## 🐳 Docker Services

The `docker-compose.yaml` file defines the following infrastructure:

| Service | Hostname | Port | Description | Used By |
|---------|----------|------|-------------|---------|
| PostgreSQL | `db-sql` | 5432 | SQL database (multiple logical databases) | Identity, Course, Reviews Services |
| MongoDB | `db-nosql` | 27017 | NoSQL database (multiple logical databases) | Media, Progress Services |
| Redis | `caching-service` | 6379 | In-memory cache (no persistence) | API Gateway, Course Service |
| RabbitMQ | `message-broker` | 5672, 15672 | Message broker (AMQP + Management UI) | All services (async events) |
| Meilisearch | `search-engine` | 7700 | Search engine (master key: `masterKey`) | Indexer Service |
| MinIO | `minio` | 9000, 9001 | S3-compatible object storage (API + Console) | Media Service |

### Infrastructure Details

**Redis (`caching-service:6379`)**
- Pure cache, no persistence
- Used for session storage and API response caching
- Accessible at `caching-service:6379` from services

**Meilisearch (`search-engine:7700`)**
- Master key: `masterKey`
- Used by Indexer Service only (internally)
- Indexes: `courses`, `reviews`
- API Gateway may query indirectly via Indexer Service later

**MinIO (`minio:9000/9001`)**
- API Port: `9000` (S3-compatible API)
- Console/UI: `9001` (Web interface)
- Bucket: `skillbase-media` (auto-created, public)
- Used by Media Service for uploads and signed URLs

### Accessing Services

**RabbitMQ Management UI:** http://localhost:15672
- Username: `skillbaseadmin`
- Password: `password123`

**MinIO Web UI:** http://localhost:9001
- Username: `minioadmin`
- Password: `minioadmin123`
- Bucket: `skillbase-media` (auto-created, public)
- API Endpoint: `http://minio:9000` (internal), `http://localhost:9000` (host)

## 📝 License

This project is [UNLICENSED](LICENSE).

## 👤 Author

https-404
