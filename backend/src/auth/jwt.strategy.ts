import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload, JwtValidateReturn } from "./auth.interfaces";
import { ConfigService } from "@nestjs/config";
import { getRequiredAppConfig } from "../config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../database/entities/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    const appConfig = getRequiredAppConfig(configService);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig.jwt.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtValidateReturn> {
    // Validate that the user exists in the database
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException(
        `User account not found (ID: ${payload.sub}). Your session may have expired or your account may have been removed. Please log in again.`,
      );
    }

    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
      firstName: payload.firstName,
      lastName: payload.lastName,
    } as JwtValidateReturn & { roles: string[] };
  }
}
