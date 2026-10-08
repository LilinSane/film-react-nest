import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const databaseDriver = config.getOrThrow<string>('DATABASE_DRIVER');
  if (
    databaseDriver !== 'memory' &&
    databaseDriver !== 'mongodb' &&
    databaseDriver !== 'postgres'
  ) {
    throw new Error(
      `Unsupported database driver "${databaseDriver}". Use "memory", "mongodb", or "postgres".`,
    );
  }

  const port = Number(config.get<string>('PORT', '3000'));
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  app.setGlobalPrefix('api/afisha');
  app.enableCors();
  await app.listen(port);
}
bootstrap();
