import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamePlayer } from './game/game-player.entity';
import { Game } from './game/game.entity';
import { GameModule } from './game/game.module';
import { Mark } from './game/mark.entity';
import { Player } from './game/player.entity';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database/db.sqlite3',
      synchronize: true,
      logging: false,
      entities: [
        Game,
        Mark,
        Player,
        GamePlayer
      ]
    }),
    GameModule,
    UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
