import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { TermLabel } from '../entities/term.entity';

export class UpdateTermDto {
  @ApiProperty({ enum: TermLabel, required: false })
  @IsEnum(TermLabel)
  @IsOptional()
  label?: TermLabel;

  @ApiProperty({ example: '2025-10-01', required: false })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsDateString()
  @IsOptional()
  end_date?: string;
}