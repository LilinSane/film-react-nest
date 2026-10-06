import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film } from '../films/schemas/film.schema';
import { FilmRepository } from './film.repository';

@Injectable()
export class MongoFilmRepository extends FilmRepository {
  constructor(@InjectModel(Film.name) private readonly filmModel: Model<Film>) {
    super();
  }

  findAll(): Promise<Film[]> {
    return this.filmModel
      .find(
        {},
        {
          _id: 0,
          id: 1,
          rating: 1,
          director: 1,
          tags: 1,
          title: 1,
          about: 1,
          description: 1,
          image: 1,
          cover: 1,
        },
      )
      .lean()
      .exec();
  }

  findById(id: string): Promise<Film | null> {
    return this.filmModel
      .findOne({ id })
      .select({ _id: 0, id: 1, schedule: 1 })
      .lean()
      .exec();
  }

  async reserveSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<boolean> {
    const result = await this.filmModel
      .updateOne(
        {
          id: filmId,
          schedule: {
            $elemMatch: {
              id: sessionId,
              taken: { $ne: seat },
            },
          },
        },
        { $addToSet: { 'schedule.$.taken': seat } },
      )
      .exec();

    return result.modifiedCount === 1;
  }

  async releaseSeat(
    filmId: string,
    sessionId: string,
    seat: string,
  ): Promise<boolean> {
    const result = await this.filmModel
      .updateOne(
        {
          id: filmId,
          schedule: { $elemMatch: { id: sessionId, taken: seat } },
        },
        { $pull: { 'schedule.$.taken': seat } },
      )
      .exec();

    return result.modifiedCount === 1;
  }
}
