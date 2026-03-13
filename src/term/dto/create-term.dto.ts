import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumber } from 'class-validator';
import { TermLabel } from '../entities/term.entity';

export class CreateTermDto {
  @ApiProperty({ example: 1, description: 'ID de l\'année scolaire' })
  @IsNumber()
  academic_year_id!: number;

  @ApiProperty({
    enum: TermLabel,
    example: TermLabel.TRIM1,
    description: 'Trimestre 1, 2 ou 3',
  })
  @IsEnum(TermLabel)
  label!: TermLabel;

  @ApiProperty({ example: '2025-10-01', description: 'Date de début du trimestre' })
  @IsDateString()
  start_date!: string;

  @ApiProperty({ example: '2025-12-31', description: 'Date de fin du trimestre' })
  @IsDateString()
  end_date!: string;
}