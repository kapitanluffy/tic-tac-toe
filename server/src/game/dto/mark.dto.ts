import { IsNumber, IsString } from 'class-validator';
import { MarkType } from "../mark"

export class MarkDto {
    @IsNumber()
    xpos: number

    @IsNumber()
    ypos: number

    @IsNumber()
    playerId: number

    @IsString()
    mark: MarkType
}
