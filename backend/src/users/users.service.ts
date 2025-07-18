import { Injectable, ConflictException, NotFoundException, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../database/entities/user.entity";
import { Role } from "../database/entities/role.entity";
import { RegisterDto } from "../auth/dto/register.dto";
import { LoginDto } from "../auth/dto/login.dto";
import { UpdateUserDto } from "../auth/dto/update-user.dto";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email }, relations: ["roles"] });
  }

  async register(registerDto: RegisterDto): Promise<User> {
    this.logger.debug(`Register method called with DTO: ${JSON.stringify(registerDto)}`);

    const { email, firstName, lastName, password } = registerDto;
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      this.logger.warn(`Registration failed: Email already in use for email ${email}`);
      throw new ConflictException("Email is already in use");
    }

    // Find or create the USER role
    let userRole = await this.rolesRepository.findOne({ where: { name: "USER" } });
    if (!userRole) {
      this.logger.debug("USER role not found, creating it");
      userRole = this.rolesRepository.create({ name: "USER" });
      userRole = await this.rolesRepository.save(userRole);
    }

    const user = this.usersRepository.create({
      email,
      firstName,
      lastName,
      password,
      roles: [userRole],
    });
    const createdUser = await this.usersRepository.save(user);
    this.logger.debug(`User created successfully with id: ${createdUser.id}`);

    // Reload the user with relations to ensure roles are properly loaded
    const userWithRoles = await this.usersRepository.findOne({
      where: { id: createdUser.id },
      relations: ["roles"],
    });

    if (!userWithRoles) {
      throw new Error("Failed to create user");
    }

    return userWithRoles;
  }

  async validateUser(loginDto: LoginDto): Promise<User> {
    const { email, password } = loginDto;
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      throw new NotFoundException("Invalid email or password");
    }

    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ["roles"] });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.usersRepository.softDelete(id);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
