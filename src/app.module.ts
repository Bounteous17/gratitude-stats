// Packages
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
// Controllers
import { AppController } from './app.controller';
// Services
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      'mongodb://node:node@localhost:27017/kaas-prod?authSource=admin',
    ),
  ],
  controllers: [AppController],
  providers: [AppService, UserService, PrismaService],
})
export class AppModule {}
