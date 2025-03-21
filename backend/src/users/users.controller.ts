import { Controller, Get, Delete, UseGuards, Body, Req, Patch } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { UserResponseDto } from '../auth/dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.id);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.update(req.user.id, updateUserDto);
    return updatedUser;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deleteAccount(@Req() req: any): Promise<{ message: string }> {
    await this.usersService.delete(req.user.id);
    return { message: 'Account deleted successfully.' };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users;
  }
}
