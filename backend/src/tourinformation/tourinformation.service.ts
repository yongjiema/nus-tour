import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TourInformation } from "../database/entities/tourinformation.entity";

@Injectable()
export class TourInformationService {
  constructor(
    @InjectRepository(TourInformation)
    private tourInformationRepository: Repository<TourInformation>,
  ) {}

  async createTourInformation(data: Partial<TourInformation>): Promise<TourInformation> {
    const tourInformation = this.tourInformationRepository.create(data);
    return this.tourInformationRepository.save(tourInformation);
  }

  async getAllTourInformation(): Promise<TourInformation[]> {
    return this.tourInformationRepository.find();
  }

  async updateTourInformation(id: number, data: Partial<TourInformation>): Promise<TourInformation> {
    await this.tourInformationRepository.update(id, data);
    return this.tourInformationRepository.findOneBy({ id });
  }
}
