import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Cycle, Level } from '../entities/classroom.entity';

export class CreateClassroomDto {
  @ApiProperty({ example: 1, description: 'ID de l\'année scolaire' })
  @IsNumber()
  academic_year_id!: number;

  @ApiProperty({ example: '6ème A', description: 'Nom de la classe' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    enum: Cycle,
    example: Cycle.COLLEGE,
    description: 'Cycle : prescolaire | primaire | college | lycee',
  })
  @IsEnum(Cycle)
  cycle!: Cycle;

  @ApiProperty({
    enum: Level,
    example: Level.SIXIEME,
    description: 'Niveau dans le cycle',
  })
  @IsEnum(Level)
  level!: Level;

  @ApiProperty({ example: 40, required: false, description: 'Capacité maximale' })
  @IsNumber()
  @IsOptional()
  capacity?: number;
}