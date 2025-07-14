import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,
    ){}

    async create(userData: CreateUserDto){
        const user = this.userRepo.create(userData);
        return this.userRepo.save(user);
    }

    findAll(){
        return this.userRepo.find();
    }

    findOne(id: string){
        return this.userRepo.findOne({where: {id}})
    }


}
