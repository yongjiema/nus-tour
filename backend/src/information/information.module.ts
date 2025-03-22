// filepath: /c:/nus-tour/backend/src/information/information.module.ts
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InformationService } from "./information.service";
import { InformationController } from "./information.controller";
import { Information } from "../database/entities/information.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Information])],
  providers: [InformationService],
  controllers: [InformationController],
})
export class InformationModule {}
