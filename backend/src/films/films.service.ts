import { Injectable, NotFoundException } from '@nestjs/common';
import { FilmRepository } from '../repository/film.repository';
import {
  FilmScheduleDto,
  FilmScheduleListDto,
  FilmsDto,
} from './dto/films.dto';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmRepository) {}

  async findAll(): Promise<FilmsDto> {
    const films = await this.filmsRepository.findAll();
    return { total: films.length, items: films };
  }

  async findSchedule(id: string): Promise<FilmScheduleListDto> {
    const film = await this.filmsRepository.findById(id);
    if (!film) {
      throw new NotFoundException(`Film "${id}" was not found`);
    }

    const items: FilmScheduleDto[] = film.schedule.map((session) => ({
      id: session.id,
      daytime: session.daytime,
      hall: String(session.hall),
      rows: session.rows,
      seats: session.seats,
      price: session.price,
      taken: session.taken,
    }));

    return { total: items.length, items };
  }
}
