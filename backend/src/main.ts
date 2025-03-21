import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = process.env.PORT || 3000;

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>("CORS_ORIGIN", "http://localhost:5173"),
    credentials: configService.get<boolean>("CORS_CREDENTIALS", true),
    methods: configService.get<string>("CORS_METHODS", "GET,POST,PUT,DELETE")?.split(","),
    allowedHeaders: configService.get<string>("CORS_HEADERS", "Content-Type,Authorization")?.split(","),
  });

  await app.listen(port);
  console.log(`🚀 Application is running at: http://localhost:${port}`);
}
bootstrap();
