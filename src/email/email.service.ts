import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { isEmail } from 'class-validator';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService implements OnModuleInit {
  private logger = new Logger(EmailService.name);
  private disposableEmailDomains: Set<string> = new Set();

  async onModuleInit() {
    await this.loadDisposableEmailBlocklist();
  }

  private async loadDisposableEmailBlocklist() {
    try {
      const blocklistPath = path.join(
        process.cwd(),
        'data',
        'disposable_email_blocklist.conf',
      );

      const content = await fs.promises.readFile(blocklistPath, 'utf8');
      const domains = content
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('//'));

      this.disposableEmailDomains = new Set(domains);
      this.logger.log(
        `Loaded ${this.disposableEmailDomains.size} disposable email domains`,
      );
    } catch (error) {
      this.logger.error('Error loading disposable email blocklist:', error);
    }
  }

  isDisposableEmail(email: string): boolean {
    if (!email) return false;

    try {
      const domain = email.split('@')[1].toLowerCase();
      return this.disposableEmailDomains.has(domain);
    } catch (error) {
      console.error(`Error checking if email is disposable: ${email}`, error);
      return false;
    }
  }

  validateSingleEmail(email: string): { email: string; isDisposable: boolean } {
    if (!email || !isEmail(email)) {
      throw new BadRequestException(`Invalid email format: ${email}`);
    }

    return {
      email,
      isDisposable: this.isDisposableEmail(email),
    };
  }
}
