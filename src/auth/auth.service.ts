import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  // ─── Utilitaires ─────────────────────────────────────────────────────────────

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // ✅ school_id ajouté dans le payload — requis pour RBAC multi-tenant
  async generateTokens(payload: { sub: number; role: string; school_id: number | null }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    const hashedRefreshToken = await this.hashPassword(refreshToken);
    await this.userRepo.update(payload.sub, { refresh_token: hashedRefreshToken });

    return { accessToken, refreshToken };
  }

  // ─── Inscription ─────────────────────────────────────────────────────────────

  async register(email: string, password: string, school_id: number) {
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new ConflictException('Cet email est déjà utilisé');

    const password_hash = await this.hashPassword(password);
    const user = this.userRepo.create({ email, password_hash, school_id });
    await this.userRepo.save(user);

    return { message: 'Utilisateur créé avec succès' };
  }

  // ─── Connexion ───────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const valid = await this.validatePassword(password, user.password_hash);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');

    // ✅ school_id dans le token → req.user.school_id disponible dans tous les controllers
    const tokens = await this.generateTokens({
      sub:       user.id,
      role:      user.role,
      school_id: user.school_id,
    });

    return {
      ...tokens,
      user: {
        id:        user.id,
        email:     user.email,
        role:      user.role,
        school_id: user.school_id,
      },
    };
  }

  // ─── Déconnexion ─────────────────────────────────────────────────────────────

  async logout(userId: number) {
    await this.userRepo.update(userId, { refresh_token: null });
    return { message: 'Déconnexion réussie' };
  }

  // ─── Rafraîchissement du token ───────────────────────────────────────────────

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });

    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Accès refusé, veuillez vous reconnecter');
    }

    const tokenMatch = await this.validatePassword(refreshToken, user.refresh_token);
    if (!tokenMatch) throw new UnauthorizedException('Refresh token invalide');

    // ✅ school_id inclus dans le token rafraîchi aussi
    return this.generateTokens({
      sub:       user.id,
      role:      user.role,
      school_id: user.school_id,
    });
  }

  // ─── Profil connecté ─────────────────────────────────────────────────────────

  async getMe(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['school'],
    });
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');

    const { password_hash, refresh_token, ...result } = user;
    return result;
  }
}