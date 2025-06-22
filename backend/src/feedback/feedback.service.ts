import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Feedback } from "../database/entities/feedback.entity";
import { Booking } from "../database/entities/booking.entity";
import { CreateFeedbackDto } from "./dto/create-feedback.dto";
import { User } from "../database/entities/user.entity";

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  async create(createFeedbackDto: CreateFeedbackDto, userId: string): Promise<Feedback> {
    const booking = await this.bookingRepository.findOne({
      where: { id: createFeedbackDto.bookingId },
    });

    if (!booking) {
      throw new NotFoundException("Booking not found");
    }

    // Create the feedback with proper relation objects
    const feedback = this.feedbackRepository.create({
      rating: createFeedbackDto.rating,
      comments: createFeedbackDto.comments,
      isPublic: createFeedbackDto.isPublic ?? false,
      user: { id: userId } as unknown as User,
      booking: { id: createFeedbackDto.bookingId } as unknown as Booking,
    });

    // Mark the booking as having feedback
    await this.bookingRepository.update(createFeedbackDto.bookingId, { hasFeedback: true });

    return this.feedbackRepository.save(feedback);
  }

  async findAll(query: Partial<Feedback> = {}): Promise<[Feedback[], number]> {
    return this.feedbackRepository.findAndCount({
      where: query,
      relations: ["user", "booking"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: number): Promise<Feedback | null> {
    return this.feedbackRepository.findOne({
      where: { id },
      relations: ["user", "booking"],
    });
  }

  async update(id: number, updateData: Partial<Feedback>): Promise<Feedback> {
    await this.feedbackRepository.update(id, updateData);
    const feedback = await this.findOne(id);
    if (feedback == null) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    return feedback;
  }

  async remove(id: number): Promise<void> {
    await this.feedbackRepository.delete(id);
  }

  async count(): Promise<number> {
    return this.feedbackRepository.count();
  }

  async getAverageRating(): Promise<number> {
    const raw: { average: string | null } | undefined = await this.feedbackRepository
      .createQueryBuilder("feedback")
      .select("AVG(feedback.rating)", "average")
      .getRawOne();
    return raw?.average ? parseFloat(raw.average) : 0;
  }

  async getFeedbacksByUserId(userId: string): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
      relations: ["booking"],
    });
  }

  async findRecent(limit: number): Promise<Feedback[]> {
    return this.feedbackRepository.find({
      order: { createdAt: "DESC" },
      take: limit,
    });
  }
}
