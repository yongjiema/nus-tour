import { Controller, Get, Put, Delete, UseGuards, Request, Body, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { UserResponseDto } from '../auth/dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get the profile of the currently authenticated user.
   * @param req - The current HTTP request
   * @returns The user's profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any): Promise<UserResponseDto> {
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Update the profile of the currently authenticated user.
   * @param req - The current HTTP request
   * @param updateUserDto - The data to update the user's profile
   * @returns The updated user profile
   */
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req: any, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.update(req.user.id, updateUserDto);
    return {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    };
  }

  /**
   * Delete the authenticated user's account.
   * @param req - The current HTTP request
   * @returns A success message
   */
  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deleteAccount(@Request() req: any): Promise<{ message: string }> {
    await this.usersService.delete(req.user.id);
    return { message: 'Account deleted successfully.' };
  }

  /**
   * Fetch all users (admin only).
   * @returns A list of all users
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    // Add role-based guard if required to restrict to admins
    const users = await this.usersService.findAll();
    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    }));
  }
}
