import { GamePlayer } from "./game-player.entity";
import { Mark } from "./mark.entity"
import { Player as PlayerModel } from "./player.entity";

export enum MarkType {
    x = "x",
    o = "o"
}

export type Grid = {
    xpos: number,
    ypos: number
}

export class PlayerMark {
    constructor(public playerId: number, public grid: Grid, public mark: MarkType) {}

    static fromModel(model: Mark) {
        const { playerId, xpos, ypos, mark } = model;

        return new PlayerMark(
            playerId,
            { xpos: xpos, ypos: ypos },
            mark
        );
    }
}

export class Player {
    constructor(public playerId: number, public mark: MarkType) {}

    static fromModel(model: GamePlayer) {
        return new Player(model.playerId, model.mark);
    }
}
