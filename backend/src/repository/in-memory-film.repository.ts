import { Injectable } from '@nestjs/common';
import { Film } from '../films/schemas/film.schema';
import { FilmRepository } from './film.repository';

@Injectable()
export class InMemoryFilmRepository extends FilmRepository {
  private readonly films = new Map<string, Film>();

  constructor() {
    super();
  }

  seed(films: Film[]): void {
    this.films.clear();
    for (const film of films) {
      this.films.set(film.id, this.cloneFilm(film));
    }
  }

  async findAll(): Promise<Film[]> {
    return [...this.films.values()].map((film) => this.cloneFilm(film));
  }

  async findById(id: string): Promise<Film | null> {
    const film = this.films.get(id);
    return film ? this.cloneFilm(film) : null;
  }

  async reserveSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<boolean> {
    const session = this.findSession(filmId, sessionId);
    if (!session || session.taken.includes(seat)) {
      return false;
    }
    session.taken.push(seat);
    return true;
  }

  async releaseSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<boolean> {
    const session = this.findSession(filmId, sessionId);
    if (!session) {
      return false;
    }
    const seatIndex = session.taken.indexOf(seat);
    if (seatIndex === -1) {
      return false;
    }
    session.taken.splice(seatIndex, 1);
    return true;
  }

  private findSession(filmId: string, sessionId: string) {
    return this.films
      .get(filmId)
      ?.schedule.find((session) => session.id === sessionId);
  }

  private cloneFilm(film: Film): Film {
    return {
      ...film,
      tags: [...film.tags],
      schedule: film.schedule.map((session) => ({
        ...session,
        taken: [...session.taken],
      })),
    };
  }
}
