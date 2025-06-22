import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { AllExceptionsFilter } from "./common/exceptions/all-exceptions.filter";
import { HttpExceptionFilter } from "./common/exceptions/http-exception.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = process.env.PORT ?? 3000;

  // Enable CORS
  app.enableCors({
    origin: configService.get<string>("CORS_ORIGIN", "http://localhost:5173"),
    credentials: configService.get<boolean>("CORS_CREDENTIALS", true),
    methods: configService.get<string>("CORS_METHODS", "GET,POST,PUT,DELETE").split(","),
    allowedHeaders: configService.get<string>("CORS_HEADERS", "Content-Type,Authorization").split(","),
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  await app.listen(port);

  // Application bootstrap log - standard practice in NestJS samples
  console.log(`🚀 Application is running at: http://localhost:${port}`);
}

void bootstrap();
