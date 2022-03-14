import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user/user.service';
import { PrismaService } from './prisma/prisma.service';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { connect, Connection as MongoConnection } from 'mongoose';

describe('AppController', () => {
  let app: TestingModule;
  let appController: AppController;
  let mongoConnection: MongoConnection;

  beforeAll(async () => {
    const constants = {
      mongoConnectionString:
        'mongodb://node:node@localhost:27017/kaas-prod?authSource=admin',
    };
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(constants.mongoConnectionString),
      ],
      controllers: [AppController],
      providers: [AppService, UserService, PrismaService],
    }).compile();

    mongoConnection = (await connect(constants.mongoConnectionString))
      .connection;
    appController = app.get<AppController>(AppController);
  });

  beforeEach(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection
      .collection('users')
      .insertMany([
        { user: { id: '1' }, name: 'Jest', email: 'jest@localhost.localhost' },
      ]);
  });

  afterAll(async () => {
    await mongoConnection.close();
    await app.close();
  });

  describe('root', () => {
    it('should return basic message', () => {
      expect(appController.getRoot()).toBe('Up and running ...');
    });
  });

  describe('user service', () => {
    it('should signup user', async () => {
      await appController.putMigration();
      // expect(Object.keys(user)).toHaveLength(4);
      // expect(user.id).toBeTruthy();
      // expect(user).toMatchObject({
      //   slack_id: user.slack_id,
      //   email: user.email,
      //   name: user.name,
      // });
    });
  });
});
