import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload, JwtValidateReturn } from "./auth.interfaces";
import { ConfigService } from "@nestjs/config";
import { getRequiredAppConfig } from "../config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const appConfig = getRequiredAppConfig(configService);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig.jwt.secret,
    });
  }

  validate(payload: JwtPayload): JwtValidateReturn {
    return {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
      firstName: payload.firstName,
      lastName: payload.lastName,
    } as JwtValidateReturn & { roles: string[] };
  }
}
