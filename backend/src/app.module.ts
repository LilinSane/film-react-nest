import { Injectable, Module, ValidationPipe } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConditionalModule, ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import * as path from 'node:path';

import { FilmsController } from './films/films.controller';
import { OrderController } from './order/order.controller';
import { HttpExceptionFilter } from './http-exception.filter';
import { FilmsService } from './films/films.service';
import { OrderService } from './order/order.service';
import { FilmRepository } from './repository/film.repository';
import { InMemoryFilmRepository } from './repository/in-memory-film.repository';
import { MongoFilmRepository } from './repository/mongodb-film.repository';
import { Film, FilmSchema } from './films/schemas/film.schema';

function hasDatabaseDriver(expected: 'memory' | 'mongodb') {
  return (env: NodeJS.ProcessEnv) => {
    const databaseDriver = env.DATABASE_DRIVER;
    if (databaseDriver !== 'memory' && databaseDriver !== 'mongodb') {
      throw new Error(
        `Unsupported database driver "${databaseDriver}". Use "memory" or "mongodb".`,
      );
    }
    return databaseDriver === expected;
  };
}

@Injectable()
class TransformValidationPipe extends ValidationPipe {
  constructor() {
    super({ transform: true });
  }
}

@Module({
  providers: [
    {
      provide: InMemoryFilmRepository,
      useClass: InMemoryFilmRepository,
    },
    {
      provide: FilmRepository,
      useExisting: InMemoryFilmRepository,
    },
  ],
  exports: [FilmRepository],
})
class InMemoryDatabaseModule {}

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('DATABASE_URL'),
      }),
    }),
    MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }]),
  ],
  providers: [
    {
      provide: MongoFilmRepository,
      useClass: MongoFilmRepository,
    },
    {
      provide: FilmRepository,
      useExisting: MongoFilmRepository,
    },
  ],
  exports: [FilmRepository],
})
class MongoDatabaseModule {}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: path.join(__dirname, '..', '.env'),
    }),
    ConditionalModule.registerWhen(
      InMemoryDatabaseModule,
      hasDatabaseDriver('memory'),
    ),
    ConditionalModule.registerWhen(
      MongoDatabaseModule,
      hasDatabaseDriver('mongodb'),
    ),
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', 'public', 'content', 'afisha'),
      serveRoot: '/content/afisha',
    }),
  ],
  controllers: [FilmsController, OrderController],
  providers: [
    FilmsService,
    OrderService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: TransformValidationPipe,
    },
  ],
})
export class AppModule {}
