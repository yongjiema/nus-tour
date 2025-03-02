import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from '../database/entities/feedback.entity';
import { Booking } from '../database/entities/booking.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto, userId: number): Promise<Feedback> {
    const booking = await this.bookingRepository.findOne({
      where: { id: createFeedbackDto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Create the feedback with proper relation objects
    const feedback = this.feedbackRepository.create({
      ...createFeedbackDto,
      user: { id: userId },
      booking: { id: createFeedbackDto.bookingId },
    });

    // Mark the booking as having feedback
    await this.bookingRepository.update(createFeedbackDto.bookingId, { hasFeedback: true });

    return this.feedbackRepository.save(feedback);
  }

  async findAll(query: any = {}): Promise<[Feedback[], number]> {
    return this.feedbackRepository.findAndCount({
      where: query,
      relations: ['user', 'booking'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Feedback> {
    return this.feedbackRepository.findOne({
      where: { id },
      relations: ['user', 'booking'],
    });
  }

  async update(id: number, updateData: any): Promise<Feedback> {
    await this.feedbackRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.feedbackRepository.delete(id);
  }

  async count(): Promise<number> {
    return this.feedbackRepository.count();
  }

  async getAverageRating(): Promise<number> {
    const result = await this.feedbackRepository
      .createQueryBuilder('feedback')
      .select('AVG(feedback.rating)', 'average')
      .getRawOne();
    return parseFloat(result.average) || 0;
  }

  async getFeedbacksByUserId(userId: string | number): Promise<Feedback[]> {
    const id = typeof userId === 'string' ? parseInt(userId, 10) : userId;

    return this.feedbackRepository.find({
      where: { user: { id } },
      order: { createdAt: 'DESC' },
      relations: ['booking'],
    });
  }

  async findRecent(limit: number): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
