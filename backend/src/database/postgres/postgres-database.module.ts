import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilmEntity } from './entities/film.entity';
import { FilmScheduleEntity } from './entities/schedule.entity';
import { FilmRepository } from '../../repository/film.repository';
import { PostgresFilmRepository } from '../../repository/postgres-film.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = new URL(config.getOrThrow<string>('DATABASE_URL'));
        if (
          databaseUrl.protocol !== 'postgres:' &&
          databaseUrl.protocol !== 'postgresql:'
        ) {
          throw new Error('DATABASE_URL must use the postgres protocol');
        }

        return {
          type: 'postgres' as const,
          host: databaseUrl.hostname,
          port: Number(databaseUrl.port || 5432),
          database: decodeURIComponent(databaseUrl.pathname.slice(1)),
          username: config.getOrThrow<string>('DATABASE_USERNAME'),
          password: config.getOrThrow<string>('DATABASE_PASSWORD'),
          entities: [FilmEntity, FilmScheduleEntity],
          synchronize: false,
        };
      },
    }),
    TypeOrmModule.forFeature([FilmEntity, FilmScheduleEntity]),
  ],
  providers: [
    PostgresFilmRepository,
    {
      provide: FilmRepository,
      useExisting: PostgresFilmRepository,
    },
  ],
  exports: [FilmRepository],
})
export class PostgresDatabaseModule {}
