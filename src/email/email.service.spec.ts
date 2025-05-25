import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
    await service.onModuleInit();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should detect disposable emails', () => {
    // These are from the blocklist
    expect(service.isDisposableEmail('test@10minutemail.com')).toBe(true);
    expect(service.isDisposableEmail('user@mailinator.com')).toBe(true);
    expect(service.isDisposableEmail('sample@temp-mail.org')).toBe(true);
  });

  it('should not flag legitimate emails as disposable', () => {
    expect(service.isDisposableEmail('user@gmail.com')).toBe(false);
    expect(service.isDisposableEmail('business@microsoft.com')).toBe(false);
    expect(service.isDisposableEmail('person@yahoo.com')).toBe(false);
  });
});
