// src/user/user.resolvers.ts

import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from './user.service';
import { LoginResponse, RegisterResponse } from 'src/auth/types';
import { LoginDto, RegisterDto } from 'src/auth/dto';
import { Response, Request } from 'express';
import { BadRequestException, UseFilters } from '@nestjs/common';
import { GraphQLErrorFilter } from 'src/filters/custom-exception.filter';

// @UseFilters(GraphQLErrorFilter): GraphQL 예외를 처리할 필터를 지정한다.
// 이 데코레이터는 현재 뮤테이션에서 발생하는 예외를 처리하기 위해 GraphQLErrorFilter를 사용하겠다는 것을 나타낸다.
@UseFilters(GraphQLErrorFilter)
@Resolver()
export class UserResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  // 사용자 등록을 처리하는 뮤테이션
  @Mutation(() => RegisterResponse)
  async register(
    @Args('registerInput') registerDto: RegisterDto, // GraphQL 뮤테이션에서 전달된 입력 데이터
    @Context() context: { res: Response }, // Express 응답 객체
  ): Promise<RegisterResponse> {
    // 비밀번호와 확인 비밀번호를 비교하여 일치하지 않으면 예외 발생
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException({
        confirmPassword: 'Password and confirm password are not the same.',
      });
    }

    // AuthService를 사용하여 사용자 등록을 시도하고 결과를 반환
    const { user } = await this.authService.register(
      registerDto,
      context.res, // Express 응답 객체를 전달하여 쿠키를 설정
    );

    console.log('user', user);

    return { user };
  }

  // 사용자 로그인을 처리하는 뮤테이션
  @Mutation(() => LoginResponse)
  async login(
    @Args('loginInput') loginDto: LoginDto, // GraphQL 뮤테이션에서 전달된 입력 데이터
    @Context() context: { res: Response }, // Express 응답 객체
  ): Promise<LoginResponse> {
    // AuthService를 사용하여 사용자 로그인을 시도하고 결과를 반환
    return this.authService.login(loginDto, context.res); // Express 응답 객체를 전달하여 인증 쿠키를 설정
  }

  // 사용자 로그아웃을 처리하는 뮤테이션
  @Mutation(() => String)
  async logout(@Context() context: { res: Response }) {
    // AuthService를 사용하여 사용자 로그아웃을 처리
    this.authService.logout(context.res); // Express 응답 객체를 전달하여 인증 쿠키를 제거
  }

  // 액세스 토큰을 갱신하는 뮤테이션
  @Mutation(() => String)
  async refreshToken(@Context() context: { req: Request; res: Response }) {
    try {
      // AuthService를 사용하여 액세스 토큰을 갱신하려고 시도
      return this.authService.refreshToken(context.req, context.res);
    } catch (error) {
      // 에러가 발생한 경우 BadRequestException 예외를 던짐
      throw new BadRequestException(error.message);
    }
  }

  @Query(() => String)
  async hello() {
    return 'hello';
  }
}
