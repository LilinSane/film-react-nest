import { Transform } from 'class-transformer';

export class FilmDto {
  id!: string;
  rating!: number;
  director!: string;
  tags!: string[];
  title!: string;
  about!: string;
  description!: string;
  image!: string;
  cover!: string;
}

export class FilmsDto {
  total!: number;
  items!: FilmDto[];
}

export class FilmScheduleDto {
  id!: string;
  daytime!: string;

  @Transform(({ value }) => String(value))
  hall!: string;
  rows!: number;
  seats!: number;
  price!: number;
  taken!: string[];
}

export class FilmScheduleListDto {
  total!: number;
  items!: FilmScheduleDto[];
}
