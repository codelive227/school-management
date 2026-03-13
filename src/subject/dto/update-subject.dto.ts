import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSubjectDto {
  @ApiProperty({ example: 'Sciences de la Vie et de la Terre', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 2, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  coefficient?: number;
}