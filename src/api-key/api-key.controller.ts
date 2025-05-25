import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseInterceptors,
  ClassSerializerInterceptor,
  UnauthorizedException,
  Patch,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dtos/create-api-key.dto';
import { ApiKeyDto } from './dtos/api-key.dto';

@Controller({
  path: 'api_keys',
  version: '1',
})
@UseInterceptors(ClassSerializerInterceptor)
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Get()
  async getApiKeys(@Req() request): Promise<ApiKeyDto[]> {
    return this.apiKeyService.getUserApiKeys(request.user.id);
  }

  @Post()
  async generateApiKey(
    @Req() request,
    @Body() createApiKeyDto: CreateApiKeyDto,
  ) {
    return this.apiKeyService.generateApiKey(request.user.id, createApiKeyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeApiKey(
    @Req() request,
    @Param('id') apiKeyId: string,
  ): Promise<void> {
    return this.apiKeyService.revokeApiKey(request.user.id, apiKeyId);
  }

  @Get(':id')
  async getApiKey(
    @Req() request,
    @Param('id') apiKeyId: string,
  ): Promise<ApiKeyDto> {
    // Get a specific API key (must be owned by the user)
    const apiKey = await this.apiKeyService.getApiKeyById(apiKeyId);

    // Check if the API key belongs to the requesting user
    if (apiKey.user_id !== request.user.id) {
      throw new UnauthorizedException('You do not own this API key');
    }

    return apiKey;
  }

  @Patch(':id')
  async updateApiKey(
    @Req() request,
    @Param('id') apiKeyId: string,
    @Body() updateData: Partial<CreateApiKeyDto>,
  ): Promise<ApiKeyDto> {
    // Update the API key with the provided data
    return this.apiKeyService.updateApiKey(
      request.user.id,
      apiKeyId,
      updateData,
    );
  }
}
