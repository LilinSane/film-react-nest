import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { FilmScheduleEntity } from './schedule.entity';

@Entity({ name: 'films' })
export class FilmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('double precision')
  rating!: number;

  @Column('varchar')
  director!: string;

  @Column('text', {
    transformer: {
      to: (tags: string[]) => tags.join(','),
      from: (tags: string) => (tags ? tags.split(',') : []),
    },
  })
  tags!: string[];

  @Column('varchar')
  image!: string;

  @Column('varchar')
  cover!: string;

  @Column('varchar')
  title!: string;

  @Column('varchar')
  about!: string;

  @Column('varchar')
  description!: string;

  @OneToMany(() => FilmScheduleEntity, (schedule) => schedule.film)
  schedule!: FilmScheduleEntity[];
}
