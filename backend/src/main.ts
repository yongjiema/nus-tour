import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Starting NestJS application...');
  try {
    const app = await NestFactory.create(AppModule);
    console.log('NestJS application created successfully');
    
    const configService = app.get(ConfigService);
    const port = process.env.PORT || 3000;
    console.log(`Configured port: ${port}`);

    // Enable CORS
    app.enableCors({
      origin: true, // Allow all origins
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    });
    console.log('CORS enabled');

    try {
      // Listen on all interfaces
      await app.listen(port, '0.0.0.0');
      console.log(`🚀 Application is running at: http://localhost:${port}`);
      
      // Log database connection status
      const server = app.getHttpServer();
      console.log('Server started successfully');
    } catch (error) {
      console.error('Failed to start the server:', error);
      process.exit(1);
    }
  } catch (error) {
    console.error('Failed to create NestJS application:', error);
    process.exit(1);
  }
}
bootstrap();
