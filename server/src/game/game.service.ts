import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { GamePlayer } from './game-player.entity';
import { Game } from './game.entity';
import { Grid, MarkType, Player, PlayerMark } from './mark';
import { Mark } from './mark.entity';
import { Player as PlayerModel } from './player.entity';

export enum GameStatus {
    finished = "finished",
    draw = "draw",
    ongoing = "ongoing"
}

export type GameState = {
    winningPlayer?: number,
    playerTurn?: number
    status: GameStatus
}

@Injectable()
export class GameService {
    constructor(
        @InjectRepository(Game)
        protected gamesRepo: Repository<Game>,
        @InjectRepository(GamePlayer)
        protected gamePlayersRepo: Repository<GamePlayer>,
        @InjectRepository(Mark)
        protected marksRepo: Repository<Mark>
    ) {}

    async getGame(gameId: number) {
        return await this.gamesRepo.findOneBy({ id: gameId });
    }

    async createGame(players: Player[], size: number = 7) {
        const firstPlayer = players.find((p) => p.mark === MarkType.x);

        const state = {
            status: GameStatus.ongoing,
            playerTurn: firstPlayer.playerId
        }

        const game = this.gamesRepo.create({
            size,
            state
        })
        await this.gamesRepo.save(game);

        for (const player of players) {
            const p = this.gamePlayersRepo.create({ gameId: game.id, playerId: player.playerId, mark: player.mark })
            await this.gamePlayersRepo.save(p);
        }

        return game;
    }

    async getBoard(game: Game) {
        const marks = await this.marksRepo.find({
            where: { gameId: game.id }
        }).then((marks) => {
            return marks.map((m) => {
                return PlayerMark.fromModel(m)
            });
        })

        const xLen = game.size;
        const yLen = game.size;
        const board = []

        for(let y=0; y<yLen; y++) {
            for(let x=0; x<xLen; x++) {
                if (!(y in board)) board[y] = []
                board[y].push(null)
            }
        }

        for (const m of marks) {
            board[m.grid.ypos][m.grid.xpos] = m
        }

        return board;
    }

    async getPlayers(game: Game) {
        const players = await this.gamePlayersRepo.findBy({
            gameId: game.id
        }).then((players) => players.map((p) => Player.fromModel(p)))

        return players;
    }

    async isGridValid(grid: Grid, gameId: number) {
        const game = await this.gamesRepo.findOneBy({ id: gameId });

        if (grid.xpos > (game.size - 1) || grid.ypos > (game.size - 1)) {
            return false;
        }

        const isValid = await this.marksRepo.findOne({
            where: {
                gameId: gameId,
                xpos: grid.xpos,
                ypos: grid.ypos
            }
        })

        return !!isValid !== true;
    }

    async isPlayerTurnValid(game: Game, mark: PlayerMark) {
        const player = await this.gamePlayersRepo.findOneBy({ gameId: game.id, playerId: mark.playerId });

        return game.state.playerTurn === mark.playerId && player.mark === mark.mark;
    }

    async setMark(game: Game, playerMark: PlayerMark) {
        // mark: MarkType, grid: Grid, gameId: number, playerId: number) {
        let _mark = this.marksRepo.create({
            gameId: game.id,
            playerId: playerMark.playerId,
            mark: playerMark.mark,
            xpos: playerMark.grid.xpos,
            ypos: playerMark.grid.ypos,
        });

        _mark = await this.marksRepo.save(_mark);

        await this.gamesRepo.update(
            { id: game.id },
            { state: { ...game.state, lastMark: _mark.id } }
        )

        return _mark;
    }

    async setGameState(game: Game, outcome: GameState) {
        return await this.gamesRepo.update(
            { id: game.id },
            { state: { lastMark: game.state.lastMark, ...outcome }}
        )
    }

    getDiagonal(size, x, y) {
        const row = Math.max(y - x, 0);
        const col = Math.max(x - y, 0);
        // const size = Math.min(b.length, b[0].length);
        const max = Math.max(row, col)
        const range = [...Array(size - max).keys()]

        const grids: Grid[] = [];

        for (let g of range) {
             grids.push({ xpos: row + g, ypos: col + g })
        }

        return grids;
    }

    getDiagonalReverse(size, x, y) {
        const length = size - 1;
        const row = Math.max(Math.min(x - y, y - x), 0); // x
        const col = Math.min(x + y, length); // y

        const grids: Grid[] = [];

        let i = 0;
        let _col = col - i
        let _row = row + i

        while (!(_col < 0 || _row > (size - 1))) {
            grids.push({ xpos: _row, ypos: _col })
            i++;
            _col = col - i
            _row = row + i
        }

        return grids;
    }

    getLineMarks(grid: Grid, size: number) {
        const row: Grid[] = [];
        for (let x = 0; x < size; x++) {
            row.push({ xpos: x, ypos: grid.ypos });
        }

        const col: Grid[] = [];
        for (let y = 0; y < size; y++) {
            col.push({ ypos: y, xpos: grid.xpos });
        }

        const dia = this.getDiagonal(size, grid.xpos, grid.ypos)
        const dix = this.getDiagonalReverse(size, grid.xpos, grid.ypos)

        return [row, col, dia, dix];
    }

    async generateUpdatedState(game: Game): Promise<GameState> {
        const players = await this.gamePlayersRepo.findBy({ gameId: game.id });
        const mark = await this.marksRepo.findOneBy({ id: game.state.lastMark })
        const grid = { xpos: mark.xpos, ypos: mark.ypos }
        const states = this.buildWinningModels(grid, game.size);

        for (const state of states) {
            const isStateWin = await this.isModelWinner(game, state);

            if (isStateWin) {
                return {
                    status: GameStatus.finished,
                    winningPlayer: mark.playerId
                };
            }
        }

        const playerTurn = players.find((p) => p.playerId !== game.state.playerTurn)

        return {
            status: GameStatus.ongoing,
            playerTurn: playerTurn.playerId
        };
    }

    async isModelWinner(game: Game, model: Grid[]) {
        if (model.length <= 0) return false;

        const marks = await this.marksRepo.createQueryBuilder("marks")
            .where({
                gameId: game.id
            })
            .andWhere([...model])
            .getMany();

        if (marks.length <= 0) return false;

        const hasOpponentMark = marks.find((m) => m.playerId !== game.state.playerTurn)
        if (hasOpponentMark) return false;

        const isWinner = model.every((m) => {
            return marks.find((mark) => mark.xpos === m.xpos && mark.ypos === m.ypos) !== undefined
        })

        return isWinner;
    }

    buildWinningModels(grid: Grid, size: number) {
        const lines = this.getLineMarks(grid, size)

        return lines.map((line) => {
            const start = line.findIndex((g) => g.xpos === grid.xpos && g.ypos === grid.ypos)

            let indexes = Array(5).fill(null).reduce((o) => {
                o.push(start + o.length)
                return o;
            }, [])

            const models = (indexes[indexes.length - 1] >= size || indexes[0] < 0) ? [] : [indexes];

            while (indexes[indexes.length - 1] !== start) {
                indexes = indexes.map((v) => v - 1)
                if (indexes[indexes.length - 1] >= size || indexes[0] < 0) continue;

                models.push(indexes)
            }

            return models.map(
                (m) => m.map((i) => line[i]) // convert indexes to line marks
            ).filter(
                (m) => !m.some((l) => l === undefined) // remove models with undefined
            );
        }).flat();
    }
}
