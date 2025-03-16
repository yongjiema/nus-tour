import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsEvent } from '../database/entities/news-event.entity';
import { NewsEventService } from './news-event.service';
import { NewsEventController } from './news-event.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NewsEvent])],
  providers: [NewsEventService],
  controllers: [NewsEventController],
  exports: [NewsEventService],
})
export class NewsEventModule {} 