import {IsEmail, IsEnum, IsNotEmpty, IsOptional, IsBoolean} from 'class-validator';

export class CreateUserDto{
    @IsNotEmpty()
    firstname: string;

    @IsNotEmpty()
    lastname: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsOptional()
    @IsBoolean()
    isEmailVerified?: boolean;
}