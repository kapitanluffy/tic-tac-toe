import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(protected service: UserService) {}

    @Post('/')
    async createUser(@Body() data: CreateUserDto) {
        return this.service.createUser(data)
    }
}
