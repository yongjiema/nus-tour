import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Role } from "../entities/role.entity";

@Injectable()
export class RoleSeeder {
  private readonly logger = new Logger(RoleSeeder.name);
  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
  ) {}

  /**
   * Ensure that the canonical roles exist. Returns the full list so that
   * other seeders (admin user) can depend on it.
   */
  async seed(): Promise<Role[]> {
    const canonical = ["ADMIN", "USER"];
    const found = await this.repo.find({ where: { name: In(canonical) } });
    if (found.length === canonical.length) {
      return found;
    }

    // Create missing roles only
    const toCreate = canonical
      .filter((r) => !found.find((f) => f.name === r))
      .map((name) => this.repo.create({ name }));

    const saved = await this.repo.save(toCreate);
    this.logger.log(`Seeded roles → ${saved.map((r) => r.name).join(", ")}`);
    return [...found, ...saved];
  }
}
