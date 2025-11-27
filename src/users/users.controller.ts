import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string, @Query('filter') filter?: string) {
    return this.usersService.getStats(+id, filter);
  }

  @Patch(':id/avatar')
  updateAvatar(@Param('id') id: string, @Body() body: { avatar: string }) {
    return this.usersService.updateAvatar(+id, body.avatar);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
