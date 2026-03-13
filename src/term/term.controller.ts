import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, UseGuards, ParseIntPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TermService } from './term.service';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';
import { JwtAccessGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Terms')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller('terms')
export class TermController {
  constructor(private readonly service: TermService) {}

  // USA02 : ADMIN crée un trimestre
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Créer un trimestre' })
  @ApiResponse({ status: 201, description: 'Trimestre créé.' })
  create(@Body() dto: CreateTermDto) {
    return this.service.create(dto);
  }

  // ADMIN et TEACHER voient les trimestres d'une année
  @Get('academic-year/:academicYearId')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: '[ADMIN, TEACHER] Lister les trimestres d\'une année scolaire' })
  findByAcademicYear(@Param('academicYearId', ParseIntPipe) id: number) {
    return this.service.findByAcademicYear(id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: '[ADMIN, TEACHER] Voir un trimestre' })
  @ApiResponse({ status: 404, description: 'Trimestre introuvable.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Modifier un trimestre' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTermDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[ADMIN] Supprimer un trimestre' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}