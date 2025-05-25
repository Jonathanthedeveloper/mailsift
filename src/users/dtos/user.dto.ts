import { UserRole } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;

  @Exclude()
  password_hash: string;

  @Exclude()
  deleted_at: Date | null;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
