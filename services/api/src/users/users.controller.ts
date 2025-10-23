import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  async get(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return { id: user?.id, email: user?.email, name: user?.name, role: user?.role };
  }
}
