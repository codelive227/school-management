import { isEmail } from './../../../node_modules/@types/validator/index.d';
import { IsEmail, IsNotEmpty, MinLength, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Role } from '../../users/entities/user.entity';

export class RegisterDto {
    @ApiProperty({ example: 'test@example.com' })
    @IsEmail()
    email!: string;


    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @MinLength(4)
    password!: string;


    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    school_id!: number;

     @ApiProperty({ enum: Role, example: Role.STUDENT })
  @IsEnum(Role)
  role!: Role;
}