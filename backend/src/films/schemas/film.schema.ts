import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class FilmSchedule {
  @Prop({ required: true, type: String })
  id!: string;

  @Prop({ required: true, type: String })
  daytime!: string;

  @Prop({ required: true, type: Number })
  hall!: number;

  @Prop({ required: true, type: Number })
  rows!: number;

  @Prop({ required: true, type: Number })
  seats!: number;

  @Prop({ required: true, type: Number })
  price!: number;

  @Prop({ type: [String], default: [] })
  taken!: string[];
}

export const FilmScheduleSchema = SchemaFactory.createForClass(FilmSchedule);

@Schema({ collection: 'films', id: false, versionKey: false })
export class Film {
  @Prop({ required: true, type: String })
  id!: string;

  @Prop({ required: true, type: Number })
  rating!: number;

  @Prop({ required: true, type: String })
  director!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ required: true, type: String })
  image!: string;

  @Prop({ required: true, type: String })
  cover!: string;

  @Prop({ required: true, type: String })
  title!: string;

  @Prop({ required: true, type: String })
  about!: string;

  @Prop({ required: true, type: String })
  description!: string;

  @Prop({ type: [FilmScheduleSchema], default: [] })
  schedule!: FilmSchedule[];
}

export const FilmSchema = SchemaFactory.createForClass(Film);
