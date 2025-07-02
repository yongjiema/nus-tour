import { Module, forwardRef } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { TokenBlacklistService } from "./token-blacklist.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthController } from "./auth.controller";
import { RolesGuard } from "./roles.guard";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { getRequiredAppConfig } from "../config";

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const appConfig = getRequiredAppConfig(cfg);
        return {
          secret: appConfig.jwt.secret,
          signOptions: { expiresIn: appConfig.jwt.expiresIn },
        };
      },
    }),
    forwardRef(() => UsersModule),
  ],
  providers: [AuthService, JwtStrategy, TokenBlacklistService, JwtAuthGuard, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, PassportModule, JwtModule, TokenBlacklistService, JwtAuthGuard, JwtStrategy, RolesGuard],
})
export class AuthModule {
  configure() {
    // Auth module configuration
  }
}
