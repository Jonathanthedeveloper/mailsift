import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../api-key.service';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Extract API key from request headers
    const apiKey = req.headers['x-api-key'] as string;

    // Skip if no API key is provided
    if (!apiKey) {
      return next();
    }

    // Log the API usage
    const requestStartTime = Date.now();
    res.on('finish', () => {
      const responseTime = Date.now() - requestStartTime;
      this.apiKeyService
        .logApiKeyUsage({
          apiKey: apiKey,
          userId: '', // TODO: Add the correct user ID here
          endpoint: req.originalUrl,
          method: req.method,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'] as string,
          response: '', // Response body is not easily accessible here
          responseTime: responseTime,
          statusCode: res.statusCode,
          error: res.statusCode >= 400 ? res.statusMessage : undefined,
        })
        .catch((error) => console.error('Failed to log API usage:', error));
    });

    next();
  }
}
