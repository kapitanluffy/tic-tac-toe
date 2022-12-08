import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { MarkType } from './mark';

@Entity()
export class Mark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameId: number;

  @Column()
  playerId: number;

  @Column()
  xpos: number;

  @Column()
  ypos: number;

  @Column()
  mark: MarkType;
}
