import { MiddlewareConsumer, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiKeyMiddleware } from 'src/api-key/middleware/api-key.middleware';
import { EmailController } from './email.controller';
import { ApiKeyModule } from 'src/api-key/api-key.module';

@Module({
  imports: [ApiKeyModule],
  providers: [EmailService],
  controllers: [EmailController],
  exports: [EmailService],
})
export class EmailModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('emails');
  }
}
