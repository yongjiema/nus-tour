import { Controller, Get, Post, Put, Body, Param } from "@nestjs/common";
import { TourInformationService } from "./tourinformation.service";
import { TourInformation } from "../database/entities/tourinformation.entity";

@Controller("tourinformation")
export class TourInformationController {
  constructor(private readonly tourInformationService: TourInformationService) {}

  @Post()
  createTourInformation(@Body() data: Partial<TourInformation>): Promise<TourInformation> {
    return this.tourInformationService.createTourInformation(data);
  }

  @Get()
  getAllTourInformation(): Promise<TourInformation[]> {
    return this.tourInformationService.getAllTourInformation();
  }

  @Put(":id")
  updateTourInformation(@Param("id") id: number, @Body() data: Partial<TourInformation>): Promise<TourInformation> {
    return this.tourInformationService.updateTourInformation(id, data);
  }
}
