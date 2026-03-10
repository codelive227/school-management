import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { User, Role } from './entities/user.entity';
import { JwtAccessGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../auth/role.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAccessGuard, RolesGuard) // ← appliqué sur tout le controller
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ─── POST /users ──────────────────────────────────────────────────────────────
  // USA09 : ADMIN crée un enseignant, parent ou élève dans son école

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Créer un utilisateur et lui attribuer un rôle' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès.', type: User })
  @ApiResponse({ status: 403, description: 'Réservé aux administrateurs.' })
  create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: Request,
  ): Promise<User> {
    const admin = req.user as any;
    // Injecte automatiquement le school_id de l'admin (multi-tenant)
    return this.userService.create({ ...createUserDto, school_id: admin.school_id });
  }

  // ─── GET /users ───────────────────────────────────────────────────────────────
  // ADMIN voit tous les users de son école

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Lister tous les utilisateurs de l\'école' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs.', type: [User] })
  findAll(@Req() req: Request): Promise<User[]> {
    const admin = req.user as any;
    return this.userService.findBySchool(admin.school_id);
  }

  // ─── GET /users/teachers ──────────────────────────────────────────────────────
  // USA09 : ADMIN liste les enseignants pour les affecter aux classes

  @Get('teachers')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Lister tous les enseignants de l\'école' })
  @ApiResponse({ status: 200, description: 'Liste des enseignants.', type: [User] })
  findTeachers(@Req() req: Request): Promise<User[]> {
    const admin = req.user as any;
    return this.userService.findByRole(admin.school_id, Role.TEACHER);
  }

  // ─── GET /users/:id ───────────────────────────────────────────────────────────

  @Get(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Voir le détail d\'un utilisateur' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé.', type: User })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return this.userService.findOne(id);
  }

  // ─── PATCH /users/:id/role ────────────────────────────────────────────────────
  // ADMIN change le rôle d'un utilisateur existant

  @Patch(':id/role')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Attribuer ou changer le rôle d\'un utilisateur' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({ status: 200, description: 'Rôle mis à jour.' })
  assignRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignRoleDto,
  ) {
    return this.userService.assignRole(id, dto.role);
  }

  // ─── PATCH /users/:id ─────────────────────────────────────────────────────────

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: '[ADMIN] Modifier un utilisateur' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Utilisateur modifié.', type: User })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  // ─── DELETE /users/:id ────────────────────────────────────────────────────────

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '[ADMIN] Supprimer un utilisateur' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 204, description: 'Utilisateur supprimé.' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.userService.remove(id);
  }
}