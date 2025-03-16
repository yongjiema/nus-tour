import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NewsEventService } from './news-event/news-event.service';

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

    const config = new DocumentBuilder()
      .setTitle('NUS Tour API')
      .setDescription('NUS Tour API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // 获取 NewsEventService 并执行初始数据抓取
    const newsEventService = app.get(NewsEventService);
    setTimeout(() => {
      newsEventService.fetchAndSaveLatestNewsAndEvents();
    }, 5000); // 延迟5秒执行，确保数据库连接已建立

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
