import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAccessGuard } from '../guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../guards/jwt refresh.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/register
  @Post('register')
  @ApiOperation({ summary: 'Créer un compte utilisateur' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès.' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password, dto.school_id);
  }

  // POST /auth/login
  @Post('login')
  @ApiOperation({ summary: 'Se connecter et obtenir les tokens JWT' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Connexion réussie, tokens retournés.' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // POST /auth/logout
  @Post('logout')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Se déconnecter (invalide le refresh token)' })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  logout(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.logout(user.userId);
  }

  // POST /auth/refresh
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Rafraîchir les tokens avec le refresh token' })
  @ApiBody({ schema: { properties: { refreshToken: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Nouveaux tokens retournés.' })
  @ApiResponse({ status: 401, description: 'Refresh token invalide ou expiré.' })
  refresh(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.refreshTokens(user.userId, user.refreshToken);
  }

  // GET /auth/me
  @Get('me')
  @UseGuards(JwtAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir le profil de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil retourné.' })
  @ApiResponse({ status: 401, description: 'Non authentifié.' })
  getMe(@Req() req: Request) {
    const user = req.user as any;
    return this.authService.getMe(user.userId);
  }
}