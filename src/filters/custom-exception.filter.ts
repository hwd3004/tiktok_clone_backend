// src/filters/custom-exception.filter.ts

import { ApolloError } from 'apollo-server-express';
import { ArgumentsHost, Injectable } from '@nestjs/common';
import { Catch } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';

@Catch(BadRequestException)
export class GraphQLErrorFilter implements GqlExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    // BadRequestException이 발생했을 때 실행되는 메서드

    const response = exception.getResponse();

    if (typeof response === 'object') {
      // 응답이 객체 형식인 경우 ApolloError를 활용하여 GraphQL 오류를 던집니다.
      throw new ApolloError('Validation error', 'VALIDATION_ERROR', response);
    } else {
      // 응답이 객체 형식이 아닌 경우 기본적인 ApolloError를 던집니다.
      throw new ApolloError('Bad Request');
    }
  }
}
