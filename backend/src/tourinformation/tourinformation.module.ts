import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TourInformationService } from "./tourinformation.service";
import { TourInformationController } from "./tourinformation.controller";
import { TourInformation } from "../database/entities/tourinformation.entity";

@Module({
  imports: [TypeOrmModule.forFeature([TourInformation])],
  providers: [TourInformationService],
  controllers: [TourInformationController],
})
export class TourInformationModule {}
