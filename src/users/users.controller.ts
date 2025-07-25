import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService){}

    @Post()
    create(@Body() userData: CreateUserDto){
        return this.usersService.create(userData);
    }

    @Get()
    findAll(){
        return this.usersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string){
        return this.usersService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string){
        return this.usersService.remove(id);
    }
}
