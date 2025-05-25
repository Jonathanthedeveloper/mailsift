import { HttpException, Injectable } from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { PrismaService } from 'nestjs-prisma';
import { LoginDto } from './dtos/login.dto';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import crypto from 'node:crypto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async register(data: RegisterDto) {
    // check if user already exists
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (user) {
      throw new HttpException('User already exists', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create new user
    const newUser = await this.prisma.user.create({
      data: {
        email: data.email,
        password_hash: passwordHash,
        name: data.name,
      },
    });

    return {
      status: 'success',
      data: {
        name: newUser.name,
        email: newUser.email,
      },
    };
  }

  async login(data: LoginDto) {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new HttpException('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new HttpException('Invalid email or password', 401);
    }

    // Create access and refresh tokens
    const accessToken = this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
      },
      {
        expiresIn: '15m',
      },
    );

    const refreshToken = crypto.randomBytes(64).toString('hex');

    // Store refresh token in the database
    await this.prisma.refreshToken.upsert({
      where: { user_id: user.id },
      create: {
        token: refreshToken,
        user: {
          connect: { id: user.id },
        },
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 30 days
      },
      update: {
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      success: true,
      data: {
        session: {
          access_token: accessToken,
          refresh_token: refreshToken,
        },
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      },
    };
  }

  async logout(userId: string) {
    // Invalidate refresh token
    await this.prisma.refreshToken.update({
      where: { user_id: userId },
      data: { token: null, expires_at: new Date() },
    });

    return { success: true };
  }

  async refresh(data: RefreshTokenDto) {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: {
        token: data.refresh_token,
        expires_at: {
          gt: new Date(), // Check if the token is still valid
        },
      },
      include: {
        user: true,
      },
    });

    if (!refreshToken) {
      throw new HttpException('Invalid or expired refresh token', 400);
    }

    // Create new access token
    const accessToken = await this.jwtService.sign(
      {
        id: refreshToken.user.id,
        email: refreshToken.user.email,
      },
      {
        expiresIn: '15m',
      },
    );

    // Create new refresh token
    const newRefreshToken = crypto.randomBytes(64).toString('hex');

    // Update refresh token in the database
    await this.prisma.refreshToken.update({
      where: { id: refreshToken.id },
      data: {
        user: {
          update: {
            deleted_at: null,
          },
        },
        token: newRefreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return {
      success: true,
      data: {
        session: {
          access_token: accessToken,
          refresh_token: newRefreshToken,
        },
        user: {
          id: refreshToken.user.id,
          email: refreshToken.user.email,
          name: refreshToken.user.name,
        },
      },
    };
  }

  // async forgotPassword(data: ForgotPasswordDto) {
  //   // Forgot password logic here
  // }

  // async resetPassword(data: ResetPasswordDto) {
  //   // Reset password logic here
  // }
}
