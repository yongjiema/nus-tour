import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Booking } from "../database/entities/booking.entity";
import { Feedback } from "../database/entities/feedback.entity";
import { Payment } from "../database/entities/payments.entity";

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Feedback)
    private readonly feedbackRepository: Repository<Feedback>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async getStats() {
    const totalBookings = await this.bookingRepository.count();

    // Count bookings with confirmed payment status
    const confirmedBookings = await this.bookingRepository.count({
      where: {
        payment: true,
      },
    });

    // Use find() instead of count() when you need to filter results
    const bookingsWithCheckin = await this.bookingRepository.find({
      relations: ["checkin"],
    });
    const completedTours = bookingsWithCheckin.filter((booking) => booking.checkin).length;

    const feedbacks = await this.feedbackRepository.count();

    return {
      totalBookings,
      pendingCheckIns: confirmedBookings, // Bookings with confirmed payment are pending check-in
      completedTours,
      feedbacks,
    };
  }

  async getRecentActivity() {
    // Get recent bookings with proper error handling
    const recentBookings = await this.bookingRepository.find({
      order: { createdAt: "DESC" },
      take: 5,
    });

    // Get recent feedback
    const recentFeedback = await this.feedbackRepository.find({
      order: { createdAt: "DESC" },
      take: 5,
      relations: ["booking"],
    });

    // Combine and format activities with safer property access
    const activities = [
      ...recentBookings.map((booking) => ({
        id: `booking-${booking.id}`,
        type: "booking",
        description: `New booking from ${booking.name || "Guest"} for ${new Date(booking.date).toLocaleDateString()}`,
        timestamp: booking.createdAt,
      })),
      ...recentFeedback.map((feedback) => ({
        id: `feedback-${feedback.id}`,
        type: "feedback",
        description: `New ${feedback.rating}-star feedback received for booking #${feedback.booking.id}`,
        timestamp: feedback.createdAt,
      })),
    ];

    // Sort by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Return only the most recent 10 activities
    return {
      data: activities.slice(0, 10),
    };
  }
}
