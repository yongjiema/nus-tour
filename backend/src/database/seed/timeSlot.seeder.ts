import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TimeSlot } from "../entities/timeSlot.entity";

@Injectable()
export class TimeSlotSeeder {
  private readonly logger = new Logger(TimeSlotSeeder.name);
  constructor(
    @InjectRepository(TimeSlot)
    private readonly repo: Repository<TimeSlot>,
  ) {}

  async seed(): Promise<void> {
    const count = await this.repo.count();
    if (count > 0) {
      return; // already seeded
    }

    const defaultSlots: Partial<TimeSlot>[] = [
      { startsAt: "09:00:00", endsAt: "10:00:00", capacity: 5 },
      { startsAt: "10:00:00", endsAt: "11:00:00", capacity: 5 },
      { startsAt: "11:00:00", endsAt: "12:00:00", capacity: 5 },
      { startsAt: "13:00:00", endsAt: "14:00:00", capacity: 5 },
      { startsAt: "14:00:00", endsAt: "15:00:00", capacity: 5 },
      { startsAt: "15:00:00", endsAt: "16:00:00", capacity: 5 },
    ];

    await this.repo.save(defaultSlots);
    this.logger.log("Seeded default time slots");
  }
}
