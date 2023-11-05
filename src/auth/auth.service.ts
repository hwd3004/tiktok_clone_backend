// src/auth/auth.service.ts

import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { User } from '@prisma/client';
import { LoginDto, RegisterDto } from './dto';

// @Injectable 데코레이터는 클래스를 서비스(provider)로 선언하고 주입 가능한(dependency injectable) 클래스로 표시하기 위해 사용.
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // 클라이언트의 리프레시 토큰 검증, 새로운 액세스 토큰 발급.
  async refreshToken(req: Request, res: Response): Promise<string> {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    let payload;

    // 리프레시 토큰 검증.
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!userExists) {
      throw new BadRequestException('User no longer exists');
    }

    const expiresIn = 15000; // seconds
    const expiration = Math.floor(Date.now() / 1000) + expiresIn;
    const accessToken = this.jwtService.sign(
      {
        ...payload,
        exp: expiration,
      },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      },
    );

    res.cookie('access_token', accessToken, { httpOnly: true });

    return accessToken;
  }

  // 사용자에게 액세스 토큰과 리프레시 토큰을 발급.
  private async issueToken(user: User, response: Response) {
    const payload = { username: user.fullname, sub: user.id };

    const accessToken = this.jwtService.sign(
      { ...payload },
      {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '150sec',
      },
    );

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });

    response.cookie('access_token', accessToken, { httpOnly: true });
    response.cookie('refresh_token', refreshToken, { httpOnly: true });

    return { user };
  }

  // 사용자가 제공한 로그인 정보를 검증.
  async validateUser(loginDto: LoginDto): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (user && (await bcrypt.compare(loginDto.password, user.password))) {
      return user;
    }

    return null;
  }

  // 새로운 사용자 등록.
  async register(registerDto: RegisterDto, response: Response) {
    console.trace('registerDto : ', registerDto);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new Error('Email already in use'); // Provide a proper error response
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullname: registerDto.fullname,
        password: hashedPassword,
        email: registerDto.email,
      },
    });

    console.trace('user : ', user);

    return this.issueToken(user, response); // Issue tokens on registration
  }

  // 사용자의 로그인 처리.
  async login(loginDto: LoginDto, response: Response) {
    const user = await this.validateUser(loginDto);

    if (!user) {
      throw new Error('Invalid credentials'); // Provide a proper error response
    }

    return this.issueToken(user, response); // Issue tokens on login
  }

  // 사용자 로그아웃.
  async logout(response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return 'Successfully logged out';
  }
}
