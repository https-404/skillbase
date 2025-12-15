import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';
import { MongoClient } from 'mongodb';
import { Redis } from 'ioredis';
import { MeiliSearch } from 'meilisearch';
import * as Minio from 'minio';
import { INFRASTRUCTURE, SERVICE_URLS } from '@app/shared';
import { ProxyService } from './proxy.service';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  services: {
    [key: string]: ServiceHealth;
  };
  infrastructure: {
    [key: string]: InfrastructureHealth;
  };
}

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  lastChecked: string;
  uptime?: number;
  error?: string;
}

export interface InfrastructureHealth {
  status: 'healthy' | 'unhealthy';
  responseTime?: number;
  lastChecked: string;
  error?: string;
  details?: Record<string, any>;
}

@Injectable()
export class HealthService {
  private startTime: Date;
  private serviceUptimes: Map<string, { startTime: Date; lastHealthy: Date }> = new Map();

  // Infrastructure hostnames with localhost fallback for local development
  private readonly postgresHost: string;
  private readonly mongoHost: string;
  private readonly redisHost: string;
  private readonly meilisearchHost: string;
  private readonly minioHost: string;
  private readonly rabbitmqHost: string;

  constructor(
    private readonly proxyService: ProxyService,
    private readonly configService: ConfigService,
  ) {
    this.startTime = new Date();
    

    this.postgresHost = this.configService.get<string>('POSTGRES_HOST', 'localhost');
    this.mongoHost = this.configService.get<string>('MONGO_HOST', 'localhost');
    this.redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
    this.meilisearchHost = this.configService.get<string>('MEILISEARCH_HOST', 'localhost');
    this.minioHost = this.configService.get<string>('MINIO_HOST', 'localhost');
    this.rabbitmqHost = this.configService.get<string>('RABBITMQ_HOST', 'localhost');
    
    const services = ['identity', 'course', 'media', 'progress', 'reviews', 'indexer'];
    services.forEach(service => {
      this.serviceUptimes.set(service, {
        startTime: new Date(),
        lastHealthy: new Date(),
      });
    });
  }

  async getHealthStatus(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const uptime = Date.now() - this.startTime.getTime();

    const services = await this.checkAllServices();

    const infrastructure = await this.checkAllInfrastructure();

    const allServiceStatuses = Object.values(services).map(s => s.status);
    const allInfraStatuses = Object.values(infrastructure).map(i => i.status);
    const allStatuses = [...allServiceStatuses, ...allInfraStatuses];

    let overallStatus: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (allStatuses.some(s => s === 'unhealthy')) {
      overallStatus = 'unhealthy';
    }

    return {
      status: overallStatus,
      timestamp,
      uptime,
      services,
      infrastructure,
    };
  }

  
  private async checkAllServices(): Promise<Record<string, ServiceHealth>> {
    const serviceNames: Array<keyof typeof SERVICE_URLS> = [
      'IDENTITY_SERVICE',
      'COURSE_SERVICE',
      'MEDIA_SERVICE',
      'PROGRESS_SERVICE',
      'REVIEWS_SERVICE',
      'INDEXER_SERVICE',
    ];

    const checks = serviceNames.map(async (serviceKey) => {
      const serviceName = serviceKey.toLowerCase().replace('_service', '') as any;
      return this.checkService(serviceName);
    });

    const results = await Promise.all(checks);
    const serviceMap: Record<string, ServiceHealth> = {};

    serviceNames.forEach((serviceKey, index) => {
      const serviceName = serviceKey.toLowerCase().replace('_service', '');
      serviceMap[serviceName] = results[index];
    });

    return serviceMap;
  }


  private async checkService(serviceName: string): Promise<ServiceHealth> {
    const startTime = Date.now();
    const lastChecked = new Date().toISOString();

    try {
      const isHealthy = await this.proxyService.checkServiceHealth(serviceName as any);
      const responseTime = Date.now() - startTime;

      const uptimeData = this.serviceUptimes.get(serviceName);
      if (isHealthy) {
        if (uptimeData) {
          uptimeData.lastHealthy = new Date();
        }
      }

      const uptime = uptimeData
        ? Date.now() - uptimeData.startTime.getTime()
        : undefined;

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime,
        lastChecked,
        uptime,
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked,
        error: error.message,
      };
    }
  }

  /**
   * Check health of all infrastructure services
   */
  private async checkAllInfrastructure(): Promise<Record<string, InfrastructureHealth>> {
    const [postgres, mongodb, redis, meilisearch, minio, rabbitmq] = await Promise.all([
      this.checkPostgreSQL(),
      this.checkMongoDB(),
      this.checkRedis(),
      this.checkMeilisearch(),
      this.checkMinIO(),
      this.checkRabbitMQ(),
    ]);

    return {
      postgresql: postgres,
      mongodb: mongodb,
      redis: redis,
      meilisearch: meilisearch,
      minio: minio,
      rabbitmq: rabbitmq,
    };
  }

  /**
   * Check PostgreSQL health
   */
  private async checkPostgreSQL(): Promise<InfrastructureHealth> {
    const startTime = Date.now();
    const lastChecked = new Date().toISOString();
    let client: Client | null = null;

    try {
      client = new Client({
        host: this.postgresHost,
        port: this.configService.get<number>('POSTGRES_PORT', 5432),
        user: this.configService.get<string>('POSTGRES_USER', 'skillbaseadmin'),
        password: this.configService.get<string>('POSTGRES_PASSWORD', 'password123'),
        database: 'postgres',
        connectionTimeoutMillis: 5000,
      });

      await client.connect();
      const result = await client.query('SELECT NOW(), version()');
      const responseTime = Date.now() - startTime;

      await client.end();

      return {
        status: 'healthy',
        responseTime,
        lastChecked,
        details: {
          version: result.rows[0]?.version?.split(' ')[0] || 'unknown',
          serverTime: result.rows[0]?.now,
        },
      };
    } catch (error: any) {
      if (client) {
        try {
          await client.end();
        } catch {}
      }
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked,
        error: error.message,
      };
    }
  }

  /**
   * Check MongoDB health
   */
  private async checkMongoDB(): Promise<InfrastructureHealth> {
    const startTime = Date.now();
    const lastChecked = new Date().toISOString();
    let client: MongoClient | null = null;

    try {
      const mongoUser = this.configService.get<string>('MONGO_USER', 'skillbaseadmin');
      const mongoPassword = this.configService.get<string>('MONGO_PASSWORD', 'password123');
      const mongoPort = this.configService.get<number>('MONGO_PORT', 27017);
      const connectionString = `mongodb://${mongoUser}:${mongoPassword}@${this.mongoHost}:${mongoPort}/admin`;
      client = new MongoClient(connectionString, {
        serverSelectionTimeoutMS: 5000,
      });

      await client.connect();
      const adminDb = client.db('admin');
      const serverStatus = await adminDb.command({ serverStatus: 1 });
      const responseTime = Date.now() - startTime;

      await client.close();

      return {
        status: 'healthy',
        responseTime,
        lastChecked,
        details: {
          version: serverStatus.version || 'unknown',
          uptime: serverStatus.uptime,
        },
      };
    } catch (error: any) {
      if (client) {
        try {
          await client.close();
        } catch {}
      }
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked,
        error: error.message,
      };
    }
  }

  /**
   * Check Redis health
   */
  private async checkRedis(): Promise<InfrastructureHealth> {
    const startTime = Date.now();
    const lastChecked = new Date().toISOString();
    let client: Redis | null = null;

    try {
      client = new Redis({
        host: this.redisHost,
        port: this.configService.get<number>('REDIS_PORT', 6379),
        connectTimeout: 5000,
        lazyConnect: true,
      });

      await client.connect();
      const info = await client.info('server');
      const pong = await client.ping();
      const responseTime = Date.now() - startTime;

      await client.quit();

      // Parse Redis version from info
      const versionMatch = info.match(/redis_version:(.+)/);
      const version = versionMatch ? versionMatch[1] : 'unknown';

      return {
        status: pong === 'PONG' ? 'healthy' : 'unhealthy',
        responseTime,
        lastChecked,
        details: {
          version,
        },
      };
    } catch (error: any) {
      if (client) {
        try {
          await client.quit();
        } catch {}
      }
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked,
        error: error.message,
      };
    }
  }

  /**
   * Check Meilisearch health
   */
  private async checkMeilisearch(): Promise<InfrastructureHealth> {
    const startTime = Date.now();
    const lastChecked = new Date().toISOString();

    try {
      const meilisearchPort = this.configService.get<number>('MEILISEARCH_PORT', 7700);
      const meilisearchKey = this.configService.get<string>('MEILISEARCH_MASTER_KEY', 'masterKey');
      const client = new MeiliSearch({
        host: `http://${this.meilisearchHost}:${meilisearchPort}`,
        apiKey: meilisearchKey,
      });

      const health = await client.health();
      const version = await client.getVersion();
      const responseTime = Date.now() - startTime;

      return {
        status: health.status === 'available' ? 'healthy' : 'unhealthy',
        responseTime,
        lastChecked,
        details: {
          version: version.pkgVersion || 'unknown',
          status: health.status,
        },
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked,
        error: error.message,
      };
    }
  }

  /**
   * Check MinIO health
   */
  private async checkMinIO(): Promise<InfrastructureHealth> {
    const startTime = Date.now();
    const lastChecked = new Date().toISOString();

    try {
      const minioPort = this.configService.get<number>('MINIO_PORT', 9000);
      const minioAccessKey = this.configService.get<string>('MINIO_ACCESS_KEY', 'minioadmin');
      const minioSecretKey = this.configService.get<string>('MINIO_SECRET_KEY', 'minioadmin123');
      const minioBucket = this.configService.get<string>('MINIO_BUCKET', 'skillbase-media');
      
      const minioClient = new Minio.Client({
        endPoint: this.minioHost,
        port: minioPort,
        useSSL: false,
        accessKey: minioAccessKey,
        secretKey: minioSecretKey,
      });

      // Check if bucket exists (indicates connectivity)
      const bucketExists = await minioClient.bucketExists(minioBucket);
      const responseTime = Date.now() - startTime;

      return {
        status: bucketExists ? 'healthy' : 'unhealthy',
        responseTime,
        lastChecked,
        details: {
          bucket: minioBucket,
          bucketExists,
        },
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked,
        error: error.message,
      };
    }
  }

  /**
   * Check RabbitMQ health
   */
  private async checkRabbitMQ(): Promise<InfrastructureHealth> {
    const startTime = Date.now();
    const lastChecked = new Date().toISOString();

    try {
      // Check RabbitMQ management API
      const rabbitmqPort = this.configService.get<number>('RABBITMQ_MANAGEMENT_PORT', 15672);
      const rabbitmqUser = this.configService.get<string>('RABBITMQ_USER', 'skillbaseadmin');
      const rabbitmqPassword = this.configService.get<string>('RABBITMQ_PASSWORD', 'password123');
      const managementUrl = `http://${this.rabbitmqHost}:${rabbitmqPort}/api/overview`;
      const auth = Buffer.from(`${rabbitmqUser}:${rabbitmqPassword}`).toString('base64');

      const response = await fetch(managementUrl, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          status: 'healthy',
          responseTime,
          lastChecked,
          details: {
            version: data.rabbitmq_version || 'unknown',
            managementVersion: data.management_version || 'unknown',
          },
        };
      } else {
        return {
          status: 'unhealthy',
          responseTime,
          lastChecked,
          error: `HTTP ${response.status}`,
        };
      }
    } catch (error: any) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked,
        error: error.message,
      };
    }
  }
}
