import { Controller, Get, Delete, UseGuards, Body, Req, Patch } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "../auth/dto/update-user.dto";
import { UserResponseDto } from "../auth/dto/user-response.dto";
import { AuthenticatedRequest } from "../common/types/request.types";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Req() req: AuthenticatedRequest) {
    const user = await this.usersService.findById(req.user.id);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map((r) => (typeof r === "string" ? r : r.name)),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch("profile")
  async updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updatedUser = await this.usersService.update(req.user.id, updateUserDto);
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      roles: updatedUser.roles.map((r) => (typeof r === "string" ? r : r.name)),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete("profile")
  async deleteAccount(@Req() req: AuthenticatedRequest): Promise<{ message: string }> {
    await this.usersService.delete(req.user.id);
    return { message: "Account deleted successfully." };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.usersService.findAll();
    return users.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      roles: u.roles.map((r) => (typeof r === "string" ? r : r.name)),
    }));
  }
}
