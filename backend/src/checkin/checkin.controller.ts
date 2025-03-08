import { Controller, Post, Body } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CheckinDto } from './dto/checkin.dto';

@Controller('checkins')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  async checkIn(@Body() checkinDto: CheckinDto) {
    await this.checkinService.checkIn(checkinDto);
    return { message: 'Check-in successful!' };
  }
}
