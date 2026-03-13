import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAcademicYearDto {
  @ApiProperty({ example: '2025-2026', description: 'Libellé de l\'année scolaire' })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ example: '2025-10-01', description: 'Date de début' })
  @IsDateString()
  start_date!: string;

  @ApiProperty({ example: '2026-07-31', description: 'Date de fin' })
  @IsDateString()
  end_date!: string;

  @ApiProperty({ example: false, required: false, description: 'Année scolaire active ?' })
  @IsBoolean()
  @IsOptional()
  is_current?: boolean = false;
}