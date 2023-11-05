// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { join } from 'path';

import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  // imports 배열은 AppModule이 다른 모듈을 가져와서 이용할 수 있도록 설정함.
  imports: [
    // Graphql 모듈을 설정하고 앱에 GraphqlQL 서버를 통합. ApolloDriverConfig는 GraphQL 서버를 구성하기 위한 설정을 담고 있음.
    GraphQLModule.forRoot<ApolloDriverConfig>({
      // GraphQL 서버 설정. 아폴로 드라이버는 아폴로 서버를 사용하여 GraphQL 서버를 실행하는데 사용.
      driver: ApolloDriver,
      // Graphql 스키마 자동 생성.
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      // 스키마의 정의된 타입을 알파벳 순으로 정렬.
      sortSchema: true,
      // GraphQL 쿼리 테스트 웹 데브 툴.
      playground: true,
      // GraphQL의 리볼저 함수에서 사용한 컨텍스트 정의.
      context: ({ req, res }) => ({ req, res }),
    }),
    // ConfigModule는 NestJS 앱의 설정을 관리하는 모듈. .env 파일 자동 로드.
    ConfigModule.forRoot({}),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
