import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user/user.service';
import { PrismaService } from './prisma/prisma.service';
import { MongooseModule } from '@nestjs/mongoose';

describe('AppController', () => {
  let app: TestingModule;
  let appController: AppController;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(
          'mongodb://node:node@localhost:27017/kaas-prod?authSource=admin',
        ),
      ],
      controllers: [AppController],
      providers: [AppService, UserService, PrismaService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  afterAll(async () => app.close());

  describe('root', () => {
    it('should return basic message', () => {
      expect(appController.getRoot()).toBe('Up and running ...');
    });
  });

  describe('user service', () => {
    it('should signup user', async () => {
      const user = await appController.signupUser({
        slack_id: 'xyz',
        email: 'jest@localhost',
        name: 'Jest',
      });
      expect(Object.keys(user)).toHaveLength(4);
      expect(user.id).toBeTruthy();
      expect(user).toMatchObject({
        slack_id: user.slack_id,
        email: user.email,
        name: user.name,
      });
    });
  });
});
