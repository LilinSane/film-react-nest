import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { FilmEntity } from './film.entity';

@Entity({ name: 'schedules' })
export class FilmScheduleEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('varchar')
  daytime!: string;

  @Column('integer')
  hall!: number;

  @Column('integer')
  rows!: number;

  @Column('integer')
  seats!: number;

  @Column('double precision')
  price!: number;

  @Column('text', {
    transformer: {
      to: (taken: string[]) => taken.join(','),
      from: (taken: string) => (taken ? taken.split(',').filter(Boolean) : []),
    },
  })
  taken!: string[];

  @ManyToOne(() => FilmEntity, (film) => film.schedule)
  @JoinColumn({ name: 'filmId' })
  film!: FilmEntity;
}
