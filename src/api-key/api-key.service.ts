import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateApiKeyDto } from './dtos/create-api-key.dto';
import { ApiKeyDto } from './dtos/api-key.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ApiKeyService {
  constructor(private readonly prisma: PrismaService) {}

  async generateApiKey(
    userId: string,
    data: CreateApiKeyDto,
  ): Promise<{ data: ApiKeyDto }> {
    // Generate a secure random API key
    const secretKey = randomBytes(32).toString('hex');

    // Create a new API key in the database
    const apiKey = await this.prisma.apiKey.create({
      data: {
        key: secretKey,
        name: data.name || null,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    return {
      data: new ApiKeyDto(apiKey),
    };
  }

  async getUserApiKeys(userId: string): Promise<ApiKeyDto[]> {
    const apiKeys = await this.prisma.apiKey.findMany({
      where: {
        user_id: userId,
        revoked_at: null,
      },
    });

    return apiKeys.map((apiKey) => new ApiKeyDto(apiKey));
  }

  async revokeApiKey(userId: string, apiKeyId: string): Promise<void> {
    // First check if the API key belongs to the user
    const apiKey = await this.prisma.apiKey.findUnique({
      where: {
        id: apiKeyId,
      },
    });

    if (!apiKey) {
      throw new NotFoundException(`API key with ID ${apiKeyId} not found`);
    }

    if (apiKey.user_id !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to revoke this API key',
      );
    }

    await this.prisma.apiKey.update({
      where: {
        id: apiKeyId,
      },
      data: {
        revoked_at: new Date(),
      },
    });
  }

  async validateApiKey(key: string): Promise<ApiKeyDto | null> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: {
        key,
        revoked_at: null,
      },
      include: {
        user: true,
      },
    });

    if (!apiKey) {
      return null;
    }

    return new ApiKeyDto(apiKey);
  }

  async getApiKeyById(apiKeyId: string): Promise<ApiKeyDto> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: {
        id: apiKeyId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!apiKey) {
      throw new NotFoundException(`API key with ID ${apiKeyId} not found`);
    }

    return new ApiKeyDto(apiKey);
  }

  async updateApiKey(
    userId: string,
    apiKeyId: string,
    updateData: Partial<CreateApiKeyDto>,
  ) {
    const apiKey = await this.prisma.apiKey.update({
      where: {
        id: apiKeyId,
        user_id: userId,
      },
      data: updateData,
    });

    if (!apiKey) {
      throw new NotFoundException(`API key with ID ${apiKeyId} not found`);
    }

    return new ApiKeyDto(apiKey);
  }

  async logApiKeyUsage(data: {
    apiKey: string;
    userId: string;
    endpoint: string;
    method: string;
    ipAddress?: string;
    userAgent?: string;
    response?: string;
    responseTime?: number;
    statusCode?: number;
    error?: string;
  }): Promise<void> {
    await this.prisma.apiLog.create({
      data: {
        api_key: {
          connect: {
            id: data.apiKey,
          },
        },
        user: {
          connect: {
            id: data.userId,
          },
        },
        endpoint: data.endpoint,
        method: data.method,
        ip_address: data.ipAddress,
        user_agent: data.userAgent,
        response: data.response,
        response_time: data.responseTime,
        status_code: data.statusCode,
        error: data.error,
      },
    });
  }
}
