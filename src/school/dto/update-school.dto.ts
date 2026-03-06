import { PartialType } from '@nestjs/mapped-types';
import { CreateSchoolDto } from './create-school.dto';
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSchoolDto {
  @ApiProperty({ example: 'Nouvelle École' })
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Abidjan, Côte d’Ivoire' })
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 'http://logo.com/new.png' })
  @IsOptional()
  logo_url?: string;

  @ApiProperty({ example: '+22791111111' })
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: ['Collège'] })
  @IsOptional()
  cycles?: string[];

  @ApiProperty({ example: { max_students: 800 } })
  @IsOptional()
  settings?: Record<string, any>;
}
