import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Cycle, Level } from '../entities/classroom.entity';

export class UpdateClassroomDto {
  @ApiProperty({ example: '6ème B', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ enum: Cycle, required: false })
  @IsEnum(Cycle)
  @IsOptional()
  cycle?: Cycle;

  @ApiProperty({ enum: Level, required: false })
  @IsEnum(Level)
  @IsOptional()
  level?: Level;

  @ApiProperty({ example: 45, required: false })
  @IsNumber()
  @IsOptional()
  capacity?: number;
}