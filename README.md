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

### Running the Application

#### Development Mode

Start all services in watch mode:
```bash
pnpm run start:dev
```

Start a specific service:
```bash
pnpm run start:dev api-gateway
pnpm run start:dev identity-service
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
- Entry point for all client requests
- Authentication validation
- Request routing to microservices
- Rate limiting and caching (Redis)

### Identity Service
- User registration and authentication
- JWT token generation
- User role management (Learner/Instructor)
- Database: PostgreSQL

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

Access RabbitMQ Management UI at: http://localhost:15672
- Username: `skillbaseadmin`
- Password: `password123`

## 📝 License

This project is [UNLICENSED](LICENSE).

## 👤 Author

https-404
