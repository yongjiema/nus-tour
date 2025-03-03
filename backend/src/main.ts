import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('Starting NestJS application...');
  const app = await NestFactory.create(AppModule);
  console.log('NestJS application created');
  
  const configService = app.get(ConfigService);
<<<<<<< Updated upstream
  const port = process.env.PORT || 3000;
=======
  const port = process.env.PORT || 3456;
  console.log(`Configured port: ${port}`);
>>>>>>> Stashed changes

  // Enable CORS
  app.enableCors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  });
  console.log('CORS enabled');

  try {
    await app.listen(port);
    console.log(`🚀 Application is running at: http://localhost:${port}`);
    console.log('Available routes:');
    const server = app.getHttpServer();
    const router = server._events.request._router;
    const availableRoutes = router.stack
      .map(layer => {
        if (layer.route) {
          return {
            route: {
              path: layer.route?.path,
              method: layer.route?.stack[0].method,
            },
          };
        }
      })
      .filter(item => item !== undefined);
    console.log(availableRoutes);
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }
}
bootstrap();
