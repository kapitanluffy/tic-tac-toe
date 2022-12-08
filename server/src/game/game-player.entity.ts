import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MarkType } from './mark';

@Entity()
export class GamePlayer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  gameId: number;

  @Column()
  playerId: number;

  @Column()
  mark: MarkType;
}
