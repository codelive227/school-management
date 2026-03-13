import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, UseGuards, Req, ParseIntPipe,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AcademicYearService } from './academic-year.service';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';
import { JwtAccessGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Academic Years')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller('academic-years')
export class AcademicYearController {
  constructor(private readonly service: AcademicYearService) {}

  // USA02 : ADMIN crée une année scolaire
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Créer une année scolaire' })
  @ApiResponse({ status: 201, description: 'Année scolaire créée.' })
  create(@Body() dto: CreateAcademicYearDto, @Req() req: Request) {
    const { school_id } = req.user as any;
    return this.service.create(school_id, dto);
  }

  // USA02 : ADMIN et TEACHER voient les années
  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: '[ADMIN, TEACHER] Lister les années scolaires' })
  findAll(@Req() req: Request) {
    const { school_id } = req.user as any;
    return this.service.findAll(school_id);
  }

  // Année scolaire active
  @Get('current')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: '[ADMIN, TEACHER] Obtenir l\'année scolaire active' })
  findCurrent(@Req() req: Request) {
    const { school_id } = req.user as any;
    return this.service.findCurrent(school_id);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: '[ADMIN, TEACHER] Voir une année scolaire' })
  @ApiResponse({ status: 404, description: 'Année scolaire introuvable.' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const { school_id } = req.user as any;
    return this.service.findOne(id, school_id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Modifier une année scolaire' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAcademicYearDto,
    @Req() req: Request,
  ) {
    const { school_id } = req.user as any;
    return this.service.update(id, school_id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[ADMIN] Supprimer une année scolaire' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const { school_id } = req.user as any;
    return this.service.remove(id, school_id);
  }
}