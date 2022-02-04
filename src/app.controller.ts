import { Controller, Get } from '@nestjs/common';
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
    name?: string;
    email: string;
  }): Promise<UserModel> {
    return this.userService.createUser(userData);
  }
}
