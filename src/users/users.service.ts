import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { UserDto } from './dtos/user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UserDto[]> {
    const users = await this.prisma.user.findMany({
      where: { deleted_at: null },
    });
    return users.map((user) => new UserDto(user));
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id, deleted_at: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return new UserDto(user);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id, deleted_at: null },
      data: { deleted_at: new Date() },
    });
  }
}
