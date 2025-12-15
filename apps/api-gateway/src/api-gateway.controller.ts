import {
  Controller,
  Get,
  All,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './services/proxy.service';
import { HealthService } from './services/health.service';

@Controller()
export class ApiGatewayController {
  constructor(
    private readonly proxyService: ProxyService,
    private readonly healthService: HealthService,
  ) {}

  /**
   * Health check endpoint for all services and infrastructure
   * Internal endpoint: /internal/health
   */
  @Get('internal/health')
  @HttpCode(HttpStatus.OK)
  async getHealth() {
    return this.healthService.getHealthStatus();
  }

  /**
   * Root endpoint - API information
   */
  @Get()
  getApiInfo() {
    return {
      name: 'Skillbase API Gateway',
      version: '1.0.0',
      endpoints: {
        services: [
          '/v1/identity',
          '/v1/course',
          '/v1/media',
          '/v1/progress',
          '/v1/reviews',
          '/v1/indexer',
        ],
        health: '/internal/health',
      },
      documentation: 'https://docs.skillbase.com',
    };
  }

  /**
   * Catch-all route handler for all other requests
   * Handles both versioned and non-versioned routes
   */
  @All('*')
  async proxyRequest(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Skip health check and root endpoint
    if (req.path === '/internal/health' || req.path === '/') {
      return;
    }

    const path = req.path;
    
    // Parse the path to extract version, service, and remaining path
    // Try versioned route first: /v1/service/remaining/path
    let versionedMatch = path.match(/^\/v(\d+)\/(identity|course|media|progress|reviews|indexer)(.*)$/);
    
    if (versionedMatch) {
      const service = versionedMatch[2];
      const remainingPath = versionedMatch[3] || '';
      
      // Add query string if present
      const queryString = req.url.includes('?') 
        ? req.url.substring(req.url.indexOf('?')) 
        : '';
      const finalPath = remainingPath ? `${remainingPath}${queryString}` : queryString || '/';

      return this.forwardRequest(req, res, service, finalPath);
    }

    // Try non-versioned route: /service/remaining/path
    let legacyMatch = path.match(/^\/(identity|course|media|progress|reviews|indexer)(.*)$/);
    
    if (legacyMatch) {
      const service = legacyMatch[1];
      const remainingPath = legacyMatch[2] || '';
      
      // Add query string if present
      const queryString = req.url.includes('?') 
        ? req.url.substring(req.url.indexOf('?')) 
        : '';
      const finalPath = remainingPath ? `${remainingPath}${queryString}` : queryString || '/';

      return this.forwardRequest(req, res, service, finalPath);
    }

    // Invalid path
    return res.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Invalid API path. Use /v{version}/{service}/{path} or /{service}/{path}',
      availableServices: ['identity', 'course', 'media', 'progress', 'reviews', 'indexer'],
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }

  /**
   * Forward request to the appropriate microservice
   */
  private async forwardRequest(
    req: Request,
    res: Response,
    service: string,
    path: string,
  ) {
    try {
      const result = await this.proxyService.proxyRequest(
        service as any,
        path,
        req.method,
        req.body,
        req.headers as Record<string, string>,
        req.query as Record<string, any>,
      );

      // Set response headers (excluding some that shouldn't be forwarded)
      if (result.headers) {
        const headersToExclude = ['content-encoding', 'transfer-encoding', 'connection'];
        Object.keys(result.headers).forEach((key) => {
          if (!headersToExclude.includes(key.toLowerCase())) {
            res.setHeader(key, result.headers[key]);
          }
        });
      }

      // Send response
      res.status(result.status).json(result.data);
    } catch (error: any) {
      const status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      res.status(status).json({
        statusCode: status,
        message: error.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        path: req.url,
      });
    }
  }
}
