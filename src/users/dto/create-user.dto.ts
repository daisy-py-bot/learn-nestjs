import {IsEmail, IsEnum, IsNotEmpty} from 'class-validator';

export class CreateUserDto{
    @IsNotEmpty()
    firstname: string;

    @IsNotEmpty()
    lastname: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string
}