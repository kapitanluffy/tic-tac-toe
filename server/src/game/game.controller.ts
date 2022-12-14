import { BadRequestException, Body, Controller, Get, HttpException, NotFoundException, Param, Post } from '@nestjs/common';
import { MarkDto } from './dto/mark.dto';
import { GameService, GameStatus } from './game.service';
import { Grid, MarkType, Player, PlayerMark } from './mark';

@Controller('game')
export class GameController {
    constructor(protected service: GameService) {}

    @Post('/')
    async createGame() {
        const game = await this.service.createGame([
            new Player(1, MarkType.x),
            new Player(2, MarkType.o),
        ]);
        const board = await this.service.getBoard(game);
        const players = await this.service.getPlayers(game);

        return { game, board, players }
    }

    @Get('/:id')
    async getGame(@Param('id') gameId: number) {
        const game = await this.service.getGame(gameId);

        if (!game) {
            throw new NotFoundException(`Game ${game.id} not found`);
        }

        const board = await this.service.getBoard(game);
        const players = await this.service.getPlayers(game);


        return { game, board, players };
    }

    @Post('/:id')
    async setMark(
        @Param('id') gameId: number,
        @Body() data: MarkDto
    ) {
        const _game = await this.service.getGame(gameId);

        if (!_game || _game.state.status !== GameStatus.ongoing) {
            throw new NotFoundException(`Game ${gameId} not found`);
        }

        const grid: Grid = { xpos: data.xpos, ypos: data.ypos }
        const isGridValid = await this.service.isGridValid(grid, gameId);

        if (!isGridValid) {
            throw new BadRequestException('Invalid grid')
        }

        const mark = await this.service.createMark(data.playerId, { xpos: data.xpos, ypos: data.ypos })

        if (!await this.service.isPlayerTurnValid(_game, mark)) {
            throw new BadRequestException('Invalid player turn')
        }

        await this.service.setMark(_game, mark)

        const newState = await this.service.generateUpdatedState(_game);
        await this.service.setGameState(_game, newState);

        const board = await this.service.getBoard(_game)
        const players = await this.service.getPlayers(_game)
        const game = await this.service.getGame(gameId);

        return { game, board, players };
    }
}
