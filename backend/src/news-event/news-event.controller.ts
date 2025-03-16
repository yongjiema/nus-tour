import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { NewsEventService } from './news-event.service';
import { NewsEvent } from '../database/entities/news-event.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('news-events')
@Controller('news-events')
export class NewsEventController {
  constructor(private readonly newsEventService: NewsEventService) {}

  @Get('news')
  @ApiOperation({ summary: '获取最新5条新闻' })
  @ApiResponse({ status: 200, description: '返回最新的5条新闻', type: [NewsEvent] })
  async getLatestNews(): Promise<NewsEvent[]> {
    return this.newsEventService.getLatestNews();
  }

  @Get('events')
  @ApiOperation({ summary: '获取最新5个活动' })
  @ApiResponse({ status: 200, description: '返回最新的5个活动', type: [NewsEvent] })
  async getLatestEvents(): Promise<NewsEvent[]> {
    return this.newsEventService.getLatestEvents();
  }

  @Post('fetch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '手动获取并保存最新的新闻和活动' })
  @ApiResponse({ status: 200, description: '成功抓取数据' })
  async fetchAndSave(): Promise<{ message: string }> {
    await this.newsEventService.fetchAndSaveLatestNewsAndEvents();
    return { message: '新闻和活动数据已更新' };
  }
} 