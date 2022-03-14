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
  let prismaService: PrismaService;
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
    prismaService = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prismaService.user.deleteMany();
    await mongoConnection.dropDatabase();
    await mongoConnection.collection('users').insertMany([
      {
        user: { id: '1' },
        real_name: 'Jest',
        email: 'jest@localhost.localhost',
        image: {
          image_original: 'https://localhost/slack/images/jest.jpg',
        },
      },
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
      const users = await prismaService.user.findMany();
      expect(users).toHaveLength(1);
      const [user] = users;
      expect(Object.keys(user)).toHaveLength(5);
      expect(user.id).toBeTruthy();
      expect(user).toMatchObject({
        slack_id: '1',
        email: 'jest@localhost.localhost',
        name: 'Jest',
        avatar: 'https://localhost/slack/images/jest.jpg',
      });
    });
  });
});
