import { Module } from '@nestjs/common';
import { ApiKeyController } from './api-key.controller';
import { ApiKeyService } from './api-key.service';
import { PrismaService } from 'nestjs-prisma';

@Module({
  controllers: [ApiKeyController],
  providers: [ApiKeyService, PrismaService],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
