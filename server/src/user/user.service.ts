import { Injectable } from '@nestjs/common';
import { EntitySchema } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    async createUser(data: CreateUserDto) {
        return data;
    }
}
