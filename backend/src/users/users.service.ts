import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async register(registerDto: RegisterDto): Promise<User> {
    this.logger.debug(`Register method called with DTO: ${JSON.stringify(registerDto)}`);

    const { email, username, password } = registerDto;
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) {
      this.logger.warn(`Registration failed: Email already in use for email ${email}`);
      throw new ConflictException('Email is already in use');
    }

    const user = this.usersRepository.create({ email, username, password });
    try {
      const createdUser = await this.usersRepository.save(user);
      this.logger.debug(`User created successfully with id: ${createdUser.id}`);
      return createdUser;
    } catch (error) {
      this.logger.error(`Error saving new user: ${error.message}`, error.stack);
      throw error;
    }
  }

  async validateUser(loginDto: LoginDto): Promise<User> {
    const { email, password } = loginDto;
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      throw new NotFoundException('Invalid username or password');
    }

    return user;
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.usersRepository.softDelete(id);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
