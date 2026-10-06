import { Film } from '../films/schemas/film.schema';

export abstract class FilmRepository {
  abstract findAll(): Promise<Film[]>;
  abstract findById(id: string): Promise<Film | null>;
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
