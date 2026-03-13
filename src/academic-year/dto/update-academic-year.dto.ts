import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateAcademicYearDto {
  @ApiProperty({ example: '2025-2026', required: false })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiProperty({ example: '2025-10-01', required: false })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiProperty({ example: '2026-07-31', required: false })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  is_current?: boolean;
}