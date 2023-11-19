// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as cookieParser from 'cookie-parser';

import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // NestFactory 클래스를 사용하여 NestJS 앱을 생성.
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: [
      'http://127.0.0.1:5173',
      'http://localhost:5173',
      'https://studio.apollographql.com',
    ],
    credentials: true,
    allowedHeaders: [
      'Accept',
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'apollo-require-preflight', // Apollo GraphQL 클라이언트에서 사용되는 헤더, 실제 요청 전에 사전에 요청을 보냄
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  app.use(cookieParser());

  // 모든 요청에 대해 유효성 검사 수행.
  app.useGlobalPipes(
    // 유효성 검사 객체 생성.
    new ValidationPipe({
      // 유효성 검사 전에 요청 데이터를 자동을 변환. 예를 들어, 문자열로 전송된 숫자를 해당 데이터 유형으로 변환.
      transform: true,
      // 유효하지 않은 속성이 요청 데이터에 포함된 경우 무시됨. 이렇게 하면 요청 데이터에 불필요한 속성이 포함되어도 오류가 발생하지 않음.
      whitelist: true,
      // 유효겅 검사 오류가 발생할 때 호출되는 사용자 정의 예외 팩토리 함수. 유효성 검사 오류를 처리하고, 그 오류를 더 적절한 형식을 변환 가능.
      exceptionFactory: (errors) => {
        console.log(errors);

        // 오류 객체의 property 속성을 사용하여 새로운 형식의 오류 객체를 만들 것이다.
        // 오류 객체의 constraints 속성에서 가져온 제약 조건을 쉼표로 고분하여 문자열로 결합하여서, 읽기 쉬운 형식을 변환될 것.
        const formattedErrors = errors.reduce((accumulator, error) => {
          accumulator[error.property] = Object.values(error.constraints).join(
            ', ',
          );

          return accumulator;
        }, {});

        // 변환된 오류 객체를 사용하여 BadRequestException을 던짐.
        throw new BadRequestException(formattedErrors);
      },
    }),
  );

  await app.listen(3000);
}
bootstrap();
