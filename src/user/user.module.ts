// src/user/user.module.ts

import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    UserService,
    UserResolver,
    AuthService,
    JwtService,
    ConfigService,
    PrismaService,
  ],
})
export class UserModule {}
