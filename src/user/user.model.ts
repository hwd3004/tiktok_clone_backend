// src/user/user.model.ts

import { Field, ObjectType } from '@nestjs/graphql';

// @ObjectType 데코레이터는 클래스를 GraphQL 객체 타입으로 정의한다.
@ObjectType()
export class User {
  // @Field 데코레이터는 클래스의 필드를 GraphQL 필드로 정의한다.
  @Field()
  id?: number;

  @Field()
  fullname: string;

  @Field()
  email?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  image: string;

  @Field()
  password: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
