// src/auth/dto.ts

import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

// @InputType 데코레이터는 이 클래스가 GraphQL 입력 객체로 사용되게 하여 GraphQL 스키마와 연동되게 함.
@InputType()
export class RegisterDto {
  @Field()
  @IsNotEmpty({ message: 'Fullname is required.' })
  @IsString({ message: 'Fullname must be a string.' })
  fullname: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required.' })
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  password: string;

  // confirm password must be the same as password

  @Field()
  @IsNotEmpty({ message: 'Confirm Password is required.' })
  // must be the same as password
  confirmPassword: string;

  @Field()
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Email must be valid.' })
  email: string;
}

@InputType()
export class LoginDto {
  @Field()
  @IsNotEmpty({ message: 'Email is required.' })
  @IsEmail({}, { message: 'Email must be valid.' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Password is required.' })
  password: string;
}
