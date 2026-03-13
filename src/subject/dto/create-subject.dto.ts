import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ example: 1, description: 'ID de la classe' })
  @IsNumber()
  classroom_id!: number;

  @ApiProperty({ example: 'Mathématiques', description: 'Nom de la matière' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 3,
    description: 'Coefficient pour le calcul de la moyenne pondérée',
  })
  @IsNumber()
  @Min(1)
  coefficient!: number;
}