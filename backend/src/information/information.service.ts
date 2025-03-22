import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Information } from "../database/entities/information.entity";

@Injectable()
export class InformationService {
  constructor(
    @InjectRepository(Information)
    private informationRepository: Repository<Information>,
  ) {}

  async createInformation(data: Partial<Information>): Promise<Information> {
    const maxOrder = await this.informationRepository
      .createQueryBuilder("information")
      .select("MAX(information.order)", "max")
      .getRawOne();

    const nextOrder = (maxOrder.max || 0) + 1;
    const information = this.informationRepository.create({ ...data, order: nextOrder });
    return this.informationRepository.save(information);
  }

  async getAllInformation(): Promise<Information[]> {
    return this.informationRepository.find();
  }

  async updateInformation(id: number, data: Partial<Information>): Promise<Information> {
    await this.informationRepository.update(id, data);
    return this.informationRepository.findOneBy({ id });
  }
}
