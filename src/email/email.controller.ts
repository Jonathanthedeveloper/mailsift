import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { ApiKeyGuard } from 'src/api-key/guards/api-key.guard';
import { ApiKeyRoute } from 'src/auth/decorators/api-key-route.decorator';

@Controller({
  path: 'emails',
  version: '1',
})
@UseGuards(ApiKeyGuard)
@ApiKeyRoute()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  validateEmail(@Query('email') email: string) {
    return this.emailService.validateSingleEmail(email);
  }
}
