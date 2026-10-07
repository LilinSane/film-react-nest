import { Film } from '../films/schemas/film.schema';

export type FilmWithSchedule = Pick<Film, 'id' | 'schedule'>;

export abstract class FilmRepository {
  abstract findAll(): Promise<Film[]>;
  abstract findById(id: string): Promise<FilmWithSchedule | null>;
  abstract reserveSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<boolean>;
  abstract releaseSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<boolean>;
}
