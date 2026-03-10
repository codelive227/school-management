import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '../entities/user.entity';

export class AssignRoleDto {
  @ApiProperty({
    enum: Role,
    description: 'Rôle à attribuer',
    example: Role.TEACHER,
  })
  @IsEnum(Role)
  role: Role;
}