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

  private userMapperBO(userDAO: any): UserBO {
    return {
      slackId: userDAO.user.id,
      email: userDAO.email,
      realName: userDAO.real_name,
      image: {
        imageOriginal: userDAO.image.image_original,
      },
    };
  }

  private userMapperDAO(user: UserBO): Prisma.UserCreateInput {
    return {
      slack_id: user.slackId,
      email: user.email,
      name: user.realName,
      avatar: user.image.imageOriginal,
    };
  }

  async migrateAllUsers(): Promise<void> {
    const usersMongoDAO: any[] = await this.getBotUsers();
    const usersBO: UserBO[] = usersMongoDAO.map((user) =>
      this.userMapperBO(user),
    );
    const usersSqlDAO: Prisma.UserCreateInput[] = usersBO.map((user) =>
      this.userMapperDAO(user),
    );
    for (const user of usersSqlDAO) {
      await this.createUser(user);
    }
  }
}
