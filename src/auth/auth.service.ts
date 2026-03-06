import { hash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt' //
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class AuthService {
    constructor(
        private JwtService: JwtService,
        @InjectRepository(User) private userRepo: Repository<User>,
    ) {} //

    //
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10)
    }

    //
    async validationPassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash)
    }

    //
    async generateTokens(payload: any) {
        const accessToken = await this.JwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
        });

        const refreshToken = await this.JwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d'
        });

        return { accessToken, refreshToken}
    }

    async register(email: string, password: string, school_id: number) {
        const hash = await this.hashPassword(password);
        const user = this.userRepo.create({ email, password_hash: hash, school_id });
        await this.userRepo.save(user);
        return { message: 'Utilisateur créé avec succès' };
    }

    async login(email: string, password: string) {
        const user = await this.userRepo.findOne({ where: { email } });
        if(!user) throw new Error('Utilisateur non trouvé');

        const valid = await this.validationPassword(password, user.password_hash);
        if (!valid) throw new Error('Mot de passe incorrect');

        return this.generateTokens({ sub: user.id, role: user.role });
    }
}
