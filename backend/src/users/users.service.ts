import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Find a user by email.
   * @param email - The user's email
   * @returns The user entity or undefined if not found
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * Register a new user.
   * @param registerDto - The registration data
   * @returns The newly created user entity
   * @throws ConflictException if the email is already in use
   */
  async register(registerDto: RegisterDto): Promise<User> {
    const { email, username, password } = registerDto;

    // Check if email is already in use
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // Create and save user
    const user = this.userRepository.create({ email, username, password });
    return this.userRepository.save(user);
  }

  /**
   * Validate a user's credentials.
   * @param loginDto - The login data
   * @returns The authenticated user entity
   * @throws NotFoundException if credentials are invalid
   */
  async validateUser(loginDto: LoginDto): Promise<User> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !(await user.comparePassword(password))) {
      throw new NotFoundException('Invalid email or password');
    }

    return user;
  }

  /**
   * Find a user by ID.
   * @param id - The user's ID
   * @returns The user entity
   * @throws NotFoundException if the user is not found
   */
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Update a user's profile.
   * @param id - The user's ID
   * @param updateUserDto - The data to update the user's profile
   * @returns The updated user entity
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id); // Ensure the user exists
    Object.assign(user, updateUserDto); // Update only the fields provided
    return this.userRepository.save(user);
  }

  /**
   * Soft delete a user's account.
   * @param id - The user's ID
   * @throws NotFoundException if the user is not found
   */
  async delete(id: number): Promise<void> {
    const user = await this.findById(id); // Ensure the user exists
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.softDelete(id);
  }

  /**
   * Fetch all users.
   * @returns A list of all user entities
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
