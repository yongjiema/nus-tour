import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { InformationService } from './information.service';
import { Information } from '../database/entities/information.entity';

@Controller('information')
export class InformationController {
  constructor(private readonly informationService: InformationService) {}

  @Post()
  createInformation(@Body() data: Partial<Information>): Promise<Information> {
    return this.informationService.createInformation(data);
  }

  @Get()
  getAllInformation(): Promise<Information[]> {
    return this.informationService.getAllInformation();
  }

  @Put(':id')
  updateInformation(@Param('id') id: number, @Body() data: Partial<Information>): Promise<Information> {
    return this.informationService.updateInformation(id, data);
  }
}