import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilmEntity } from '../database/postgres/entities/film.entity';
import { FilmScheduleEntity } from '../database/postgres/entities/schedule.entity';
import {
  FilmRepository,
  FilmSummary,
  FilmWithSchedule,
} from './film.repository';

@Injectable()
export class PostgresFilmRepository extends FilmRepository {
  constructor(
    @InjectRepository(FilmEntity)
    private readonly films: Repository<FilmEntity>,
    @InjectRepository(FilmScheduleEntity)
    private readonly schedules: Repository<FilmScheduleEntity>,
  ) {
    super();
  }

  findAll(): Promise<FilmSummary[]> {
    return this.films.find({
      select: {
        id: true,
        rating: true,
        director: true,
        tags: true,
        image: true,
        cover: true,
        title: true,
        about: true,
        description: true,
      },
    });
  }

  async findById(id: string): Promise<FilmWithSchedule | null> {
    const film = await this.films.findOne({
      where: { id },
      relations: { schedule: true },
    });
    if (!film) {
      return null;
    }

    return {
      id: film.id,
      schedule: film.schedule.map(
        ({ id, daytime, hall, rows, seats, price, taken }) => ({
          id,
          daytime,
          hall,
          rows,
          seats,
          price,
          taken,
        }),
      ),
    };
  }

  async reserveSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<boolean> {
    const result = await this.schedules
      .createQueryBuilder()
      .update(FilmScheduleEntity)
      .set({
        taken: () =>
          `CASE WHEN "taken" = '' THEN :seat ELSE "taken" || ',' || :seat END`,
      })
      .where('"id" = :sessionId', { sessionId })
      .andWhere('"filmId" = :filmId', { filmId })
      .andWhere(`NOT (:seat = ANY(string_to_array("taken", ',')))`, { seat })
      .execute();

    return result.affected === 1;
  }

  async releaseSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<boolean> {
    const result = await this.schedules
      .createQueryBuilder()
      .update(FilmScheduleEntity)
      .set({
        taken: () =>
          `array_to_string(array_remove(string_to_array("taken", ','), :seat), ',')`,
      })
      .where('"id" = :sessionId', { sessionId })
      .andWhere('"filmId" = :filmId', { filmId })
      .andWhere(`:seat = ANY(string_to_array("taken", ','))`, { seat })
      .execute();

    return result.affected === 1;
  }
}
