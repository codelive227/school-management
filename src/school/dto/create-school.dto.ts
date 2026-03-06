import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSchoolDto {
  @ApiProperty({ example: 'École Centrale' })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Niamey, Niger' })
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ example: 'http://logo.com/logo.png', required: false })
  @IsOptional()
  logo_url?: string;

  @ApiProperty({ example: '+22790000000', required: false })
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: ['Primaire', 'Secondaire'] })
  @IsNotEmpty()
  cycles!: string[];

  @ApiProperty({ example: { max_students: 500 }, required: false })
  @IsOptional()
  settings?: Record<string, any>;
}
