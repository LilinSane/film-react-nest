import { DynamicModule, Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as path from 'node:path';

import { FilmsController } from './films/films.controller';
import { OrderController } from './order/order.controller';
import { FilmsService } from './films/films.service';
import { OrderService } from './order/order.service';
import { FilmRepository } from './repository/film.repository';
import { InMemoryFilmRepository } from './repository/in-memory-film.repository';
import { MongoFilmRepository } from './repository/mongodb-film.repository';
import { Film, FilmSchema } from './films/schemas/film.schema';

@Module({})
export class AppModule {
  static register(databaseDriver: 'memory' | 'mongodb'): DynamicModule {
    const repositoryProvider =
      databaseDriver === 'mongodb'
        ? [
            {
              provide: MongoFilmRepository,
              useClass: MongoFilmRepository,
            },
            {
              provide: FilmRepository,
              useExisting: MongoFilmRepository,
            },
          ]
        : [
            {
              provide: InMemoryFilmRepository,
              useClass: InMemoryFilmRepository,
            },
            {
              provide: FilmRepository,
              useExisting: InMemoryFilmRepository,
            },
          ];
    const databaseModules =
      databaseDriver === 'mongodb'
        ? [
            MongooseModule.forRootAsync({
              imports: [ConfigModule],
              inject: [ConfigService],
              useFactory: (config: ConfigService) => ({
                uri: config.getOrThrow<string>('DATABASE_URL'),
              }),
            }),
            MongooseModule.forFeature([
              { name: Film.name, schema: FilmSchema },
            ]),
          ]
        : [];

    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          envFilePath: path.join(__dirname, '..', '.env'),
        }),
        ...databaseModules,
        ServeStaticModule.forRoot({
          rootPath: path.join(__dirname, '..', 'public', 'content', 'afisha'),
          serveRoot: '/content/afisha',
        }),
      ],
      controllers: [FilmsController, OrderController],
      providers: [...repositoryProvider, FilmsService, OrderService],
    };
  }
}
