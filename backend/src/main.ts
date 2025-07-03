import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { AllExceptionsFilter } from "./common/exceptions/all-exceptions.filter";
import { HttpExceptionFilter } from "./common/exceptions/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";
import { getRequiredAppConfig } from "./config";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appConfig = getRequiredAppConfig(configService);

  // Enable CORS
  app.enableCors({
    origin: appConfig.cors.origin,
    credentials: appConfig.cors.credentials,
    methods: appConfig.cors.methods,
    allowedHeaders: appConfig.cors.headers,
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(appConfig.port);

  // Application bootstrap log - standard practice in NestJS samples
  console.log(`🚀 Application is running at: http://localhost:${appConfig.port}`);
}

void bootstrap();
