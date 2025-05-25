import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiKeyService } from '../api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    return this.validateApiKey(apiKey, request);
  }

  private async validateApiKey(key: string, request: any): Promise<boolean> {
    const validatedKey = await this.apiKeyService.validateApiKey(key);

    if (!validatedKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Attach the user to the request
    request.user = { id: validatedKey.user_id };
    request.apiKey = validatedKey;

    return true;
  }
}
