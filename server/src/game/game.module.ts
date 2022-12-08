import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { Game } from './game.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mark } from './mark.entity';
import { GamePlayer } from './game-player.entity';
import { Player } from './player.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Game, Mark, GamePlayer, Player])],
  providers: [GameService],
  controllers: [GameController]
})
export class GameModule {}
