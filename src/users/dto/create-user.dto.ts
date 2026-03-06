import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';
import { Role } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'StrongPassword123!',
    description: 'Password (min 6 characters)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({
    enum: Role,
    default: Role.STUDENT,
    description: 'Role of the user',
    example: Role.STUDENT,
  })
  @IsEnum(Role)
  role?: Role = Role.STUDENT;

  @ApiProperty({
    example: 1,
    description: 'ID of the school the user belongs to',
  })
  @IsNumber()
  @IsNotEmpty()
  school_id!: number;
}