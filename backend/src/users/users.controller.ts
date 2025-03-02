import { Controller, Get, Put, Delete, UseGuards, Request, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { UserResponseDto } from '../auth/dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.update(req.user.id, updateUserDto);
    return {
      id: Number(updatedUser.id),
      username: updatedUser.username,
      email: updatedUser.email,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deleteAccount(@Request() req: any): Promise<{ message: string }> {
    await this.usersService.delete(req.user.id);
    return { message: 'Account deleted successfully.' };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users.map((user) => ({
      id: Number(user.id),
      username: user.username,
      email: user.email,
    }));
  }
}
