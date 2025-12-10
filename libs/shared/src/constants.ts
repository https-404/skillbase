/**
 * Skillbase Architecture Constants
 * 
 * Standardized ports, hostnames, and configuration for all services and infrastructure.
 */

// ============================================================================
// Service Ports
// ============================================================================

export const SERVICE_PORTS = {
  API_GATEWAY: 3000,
  IDENTITY_SERVICE: 3001,
  COURSE_SERVICE: 3002,
  MEDIA_SERVICE: 3003,
  PROGRESS_SERVICE: 3004,
  REVIEWS_SERVICE: 3005,
  INDEXER_SERVICE: 3006,
} as const;

// ============================================================================
// Service Hostnames (Docker internal)
// ============================================================================

export const SERVICE_HOSTNAMES = {
  API_GATEWAY: 'api-gateway',
  IDENTITY_SERVICE: 'identity-service',
  COURSE_SERVICE: 'course-service',
  MEDIA_SERVICE: 'media-service',
  PROGRESS_SERVICE: 'progress-service',
  REVIEWS_SERVICE: 'reviews-service',
  INDEXER_SERVICE: 'indexer-service',
} as const;

// ============================================================================
// Service URLs (Internal - Docker network)
// ============================================================================

export const SERVICE_URLS = {
  API_GATEWAY: `http://${SERVICE_HOSTNAMES.API_GATEWAY}:${SERVICE_PORTS.API_GATEWAY}`,
  IDENTITY_SERVICE: `http://${SERVICE_HOSTNAMES.IDENTITY_SERVICE}:${SERVICE_PORTS.IDENTITY_SERVICE}`,
  COURSE_SERVICE: `http://${SERVICE_HOSTNAMES.COURSE_SERVICE}:${SERVICE_PORTS.COURSE_SERVICE}`,
  MEDIA_SERVICE: `http://${SERVICE_HOSTNAMES.MEDIA_SERVICE}:${SERVICE_PORTS.MEDIA_SERVICE}`,
  PROGRESS_SERVICE: `http://${SERVICE_HOSTNAMES.PROGRESS_SERVICE}:${SERVICE_PORTS.PROGRESS_SERVICE}`,
  REVIEWS_SERVICE: `http://${SERVICE_HOSTNAMES.REVIEWS_SERVICE}:${SERVICE_PORTS.REVIEWS_SERVICE}`,
  INDEXER_SERVICE: `http://${SERVICE_HOSTNAMES.INDEXER_SERVICE}:${SERVICE_PORTS.INDEXER_SERVICE}`,
} as const;

// ============================================================================
// API Gateway Routing
// ============================================================================

export const API_GATEWAY_ROUTES = {
  AUTH: '/auth',
  COURSES: '/courses',
  MEDIA: '/media',
  PROGRESS: '/progress',
  REVIEWS: '/reviews',
} as const;

// ============================================================================
// Database Configuration
// ============================================================================

export const DATABASE_CONFIG = {
  POSTGRESQL: {
    HOSTNAME: 'db-sql',
    PORT: 5432,
    DATABASES: {
      IDENTITY: 'identity_db',
      COURSE: 'course_db',
      REVIEWS: 'reviews_db',
    },
  },
  MONGODB: {
    HOSTNAME: 'db-nosql',
    PORT: 27017,
    DATABASES: {
      MEDIA: 'media_db',
      PROGRESS: 'progress_db',
    },
  },
} as const;

// ============================================================================
// Infrastructure Services
// ============================================================================

export const INFRASTRUCTURE = {
  REDIS: {
    HOSTNAME: 'caching-service',
    PORT: 6379,
  },
  RABBITMQ: {
    HOSTNAME: 'message-broker',
    AMQP_PORT: 5672,
    MANAGEMENT_PORT: 15672,
    EXCHANGE: 'skillbase.events',
  },
  MEILISEARCH: {
    HOSTNAME: 'search-engine',
    PORT: 7700,
    MASTER_KEY: 'masterKey',
    INDEXES: {
      COURSES: 'courses',
      REVIEWS: 'reviews',
    },
  },
  MINIO: {
    HOSTNAME: 'minio',
    API_PORT: 9000,
    CONSOLE_PORT: 9001,
    BUCKET: 'skillbase-media',
    ACCESS_KEY: 'minioadmin',
    SECRET_KEY: 'minioadmin123',
  },
} as const;

// ============================================================================
// RabbitMQ Events
// ============================================================================

export const RABBITMQ_EVENTS = {
  COURSE_PUBLISHED: 'course.published',
  LESSON_COMPLETED: 'lesson.completed',
  REVIEW_CREATED: 'review.created',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get internal service URL for service-to-service communication
 */
export function getServiceUrl(service: keyof typeof SERVICE_HOSTNAMES): string {
  return SERVICE_URLS[service];
}

/**
 * Get PostgreSQL connection string
 */
export function getPostgresConnectionString(database: keyof typeof DATABASE_CONFIG.POSTGRESQL.DATABASES): string {
  const dbName = DATABASE_CONFIG.POSTGRESQL.DATABASES[database];
  return `postgresql://skillbaseadmin:password123@${DATABASE_CONFIG.POSTGRESQL.HOSTNAME}:${DATABASE_CONFIG.POSTGRESQL.PORT}/${dbName}`;
}

/**
 * Get MongoDB connection string
 */
export function getMongoConnectionString(database: keyof typeof DATABASE_CONFIG.MONGODB.DATABASES): string {
  const dbName = DATABASE_CONFIG.MONGODB.DATABASES[database];
  return `mongodb://skillbaseadmin:password123@${DATABASE_CONFIG.MONGODB.HOSTNAME}:${DATABASE_CONFIG.MONGODB.PORT}/${dbName}?authSource=admin`;
}

/**
 * Get RabbitMQ connection string
 */
export function getRabbitMQConnectionString(): string {
  return `amqp://skillbaseadmin:password123@${INFRASTRUCTURE.RABBITMQ.HOSTNAME}:${INFRASTRUCTURE.RABBITMQ.AMQP_PORT}`;
}

