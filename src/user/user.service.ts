import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { UserBO } from 'src/@types/user';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    @InjectConnection() private connection: Connection,
  ) {}

  async getBotUsers(): Promise<any> {
    return this.connection.collection('users').find().toArray();
  }

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  private async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.upsert({
      create: data,
      update: { email: data.email },
      where: { slack_id: data.slack_id },
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  private userMapperBO(user: any): UserBO {
    return {
      slackId: user.user.id,
      email: user.email,
      name: user.name,
    };
  }

  private userMapperDAO(user: UserBO): Prisma.UserCreateInput {
    return {
      slack_id: user.slackId,
      email: user.email,
      name: user.name,
    };
  }

  async migrateAllUsers(): Promise<void> {
    const users = await this.getBotUsers();
    const usersBO: UserBO[] = users.map((user) => this.userMapperBO(user));
    const usersDAO: Prisma.UserCreateInput[] = usersBO.map((user) =>
      this.userMapperDAO(user),
    );
    for (const user of usersDAO) {
      await this.createUser(user);
    }
  }
}
