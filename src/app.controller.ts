import { Controller, Get, Put } from '@nestjs/common';
import { AppService } from './app.service';
import { UserService } from './user/user.service';
import { User as UserModel } from '@prisma/client';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
  ) {}

  @Get()
  getRoot(): string {
    return this.appService.getRoot();
  }

  async signupUser(userData: {
    slack_id: string;
    email: string;
    name?: string;
  }): Promise<UserModel> {
    return this.userService.createUser(userData);
  }

  @Put('/migrate')
  async putMigration(): Promise<void> {
    // await this.signupUser();
  }
}
