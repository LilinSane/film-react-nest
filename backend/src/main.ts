import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RequestMethod } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import * as path from 'node:path';

async function bootstrap() {
  const configContext = await NestFactory.createApplicationContext(
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: path.join(__dirname, '..', '.env'),
    }),
    { logger: false },
  );
  try {
    const config = configContext.get(ConfigService);
    const databaseDriver = config.getOrThrow<string>('DATABASE_DRIVER');
    if (databaseDriver !== 'memory' && databaseDriver !== 'mongodb') {
      throw new Error(
        `Unsupported database driver "${databaseDriver}". Use "memory" or "mongodb".`,
      );
    }

    const port = Number(config.get<string>('PORT', '3000'));
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('PORT must be an integer between 1 and 65535');
    }

    const app = await NestFactory.create(AppModule.register(databaseDriver));
    app.setGlobalPrefix('api/afisha', {
      exclude: [
        { path: 'order', method: RequestMethod.POST },
        { path: 'api/afisha/order', method: RequestMethod.POST },
      ],
    });
    app.enableCors();
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(port);
  } finally {
    await configContext.close();
  }
}
bootstrap();
