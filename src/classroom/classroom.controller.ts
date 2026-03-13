import {
  Controller, Get, Post, Body, Patch, Param,
  Delete, UseGuards, Req, ParseIntPipe,
  HttpCode, HttpStatus, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { ClassroomService } from './classroom.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { JwtAccessGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../auth/role.decorator';
import { Role } from '../users/entities/user.entity';

@ApiTags('Classrooms')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard)
@Controller('classrooms')
export class ClassroomController {
  constructor(private readonly service: ClassroomService) {}

  // USA03 : ADMIN crée une classe
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Créer une classe' })
  @ApiResponse({ status: 201, description: 'Classe créée.' })
  create(@Body() dto: CreateClassroomDto, @Req() req: Request) {
    const { school_id } = req.user as any;
    return this.service.create(school_id, dto);
  }

  // USE01 : ADMIN et TEACHER voient les classes
  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: '[ADMIN, TEACHER] Lister les classes' })
  @ApiQuery({ name: 'academicYearId', required: false, type: Number })
  findAll(
    @Req() req: Request,
    @Query('academicYearId') academicYearId?: number,
  ) {
    const { school_id } = req.user as any;
    return this.service.findAll(school_id, academicYearId ? +academicYearId : undefined);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: '[ADMIN, TEACHER] Voir une classe' })
  @ApiResponse({ status: 404, description: 'Classe introuvable.' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const { school_id } = req.user as any;
    return this.service.findOne(id, school_id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Modifier une classe' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClassroomDto,
    @Req() req: Request,
  ) {
    const { school_id } = req.user as any;
    return this.service.update(id, school_id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[ADMIN] Supprimer une classe' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const { school_id } = req.user as any;
    return this.service.remove(id, school_id);
  }
}