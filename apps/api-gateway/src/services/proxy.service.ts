import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { SERVICE_PORTS } from '@app/shared';



export type ServiceName = 'identity' | 'course' | 'media' | 'progress' | 'reviews' | 'indexer';

export interface ProxyResponse {
  data: any;
  status: number;
  headers: Record<string, string>;
}

@Injectable()
export class ProxyService {
  private readonly serviceRoutes: Record<ServiceName, string>;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Use localhost when running locally, Docker hostnames when in Docker
    const useLocalhost = this.configService.get<string>('USE_LOCALHOST', 'true') === 'true';
    const hostPrefix = useLocalhost ? 'localhost' : '';
    
    // Build service URLs based on environment
    this.serviceRoutes = {
      identity: useLocalhost 
        ? `http://localhost:${this.configService.get<number>('IDENTITYSERVICE_PORT', SERVICE_PORTS.IDENTITY_SERVICE)}`
        : `http://identity-service:${SERVICE_PORTS.IDENTITY_SERVICE}`,
      course: useLocalhost
        ? `http://localhost:${this.configService.get<number>('COURSESERVICE_PORT', SERVICE_PORTS.COURSE_SERVICE)}`
        : `http://course-service:${SERVICE_PORTS.COURSE_SERVICE}`,
      media: useLocalhost
        ? `http://localhost:${this.configService.get<number>('MEDIASERVICE_PORT', SERVICE_PORTS.MEDIA_SERVICE)}`
        : `http://media-service:${SERVICE_PORTS.MEDIA_SERVICE}`,
      progress: useLocalhost
        ? `http://localhost:${this.configService.get<number>('PROGRESSSERVICE_PORT', SERVICE_PORTS.PROGRESS_SERVICE)}`
        : `http://progress-service:${SERVICE_PORTS.PROGRESS_SERVICE}`,
      reviews: useLocalhost
        ? `http://localhost:${this.configService.get<number>('REVIEWSSERVICE_PORT', SERVICE_PORTS.REVIEWS_SERVICE)}`
        : `http://reviews-service:${SERVICE_PORTS.REVIEWS_SERVICE}`,
      indexer: useLocalhost
        ? `http://localhost:${this.configService.get<number>('INDEXERSERVICE_PORT', SERVICE_PORTS.INDEXER_SERVICE)}`
        : `http://indexer-service:${SERVICE_PORTS.INDEXER_SERVICE}`,
    };
  }

  /**
   * Proxy request to the appropriate microservice
   * @param serviceName - The service name (identity, course, media, etc.)
   * @param path - The remaining path after the service prefix
   * @param method - HTTP method
   * @param body - Request body (if any)
   * @param headers - Request headers
   * @param query - Query parameters
   */
  async proxyRequest(
    serviceName: ServiceName,
    path: string,
    method: string,
    body?: any,
    headers?: Record<string, string>,
    query?: Record<string, any>,
  ): Promise<ProxyResponse> {
    const serviceUrl = this.serviceRoutes[serviceName];
    
    if (!serviceUrl) {
      throw new HttpException(
        `Service ${serviceName} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Construct the full URL
    const url = `${serviceUrl}${path}`;
    
    // Prepare request config
    const config: any = {
      method: method.toLowerCase(),
      url,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    };

    // Add query parameters if present
    if (query && Object.keys(query).length > 0) {
      config.params = query;
    }

    // Add body for POST, PUT, PATCH requests
    if (body && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
      config.data = body;
    }

    try {
      const response = await firstValueFrom(this.httpService.request(config));
      // Convert headers to plain object to avoid exposing internal axios types
      const headers: Record<string, string> = {};
      if (response.headers) {
        Object.keys(response.headers).forEach((key) => {
          const value = response.headers[key];
          if (typeof value === 'string') {
            headers[key] = value;
          } else if (Array.isArray(value) && value.length > 0) {
            headers[key] = value[0];
          }
        });
      }
      
      return {
        data: response.data,
        status: response.status,
        headers,
      };
    } catch (error: any) {
      // Forward the error response from the microservice
      if (error.response) {
        throw new HttpException(
          error.response.data || error.message,
          error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      
      // Network or other errors
      throw new HttpException(
        `Failed to connect to ${serviceName} service: ${error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  
  async checkServiceHealth(serviceName: ServiceName): Promise<boolean> {
    const serviceUrl = this.serviceRoutes[serviceName];
    
    if (!serviceUrl) {
      return false;
    }

    try {
      // Try health endpoint first
      const response = await firstValueFrom(
        this.httpService.get(`${serviceUrl}/health`, { timeout: 5000 }),
      );
      return response.status === 200;
    } catch {
      // Fallback to root endpoint if health endpoint doesn't exist
      try {
        const response = await firstValueFrom(
          this.httpService.get(`${serviceUrl}/`, { timeout: 5000 }),
        );
        return response.status === 200;
      } catch {
        return false;
      }
    }
  }

  /**
   * Get all available service routes
   */
  getServiceRoutes(): Record<string, string> {
    return { ...this.serviceRoutes };
  }
}
