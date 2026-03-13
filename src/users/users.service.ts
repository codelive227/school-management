import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, Role } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ─── Créer un utilisateur avec rôle ──────────────────────────────────────────

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { password, ...rest } = createUserDto;
    const password_hash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({ ...rest, password_hash });
    return this.userRepository.save(user);
  }

  // ─── Attribuer / changer le rôle ─────────────────────────────────────────────

  async assignRole(userId: number, role: Role): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`Utilisateur #${userId} introuvable`);

    await this.userRepository.update(userId, { role });
    return { message: `Rôle '${role}' attribué à l'utilisateur #${userId}` };
  }

  // ─── Lister les users d'une école (multi-tenant) ──────────────────────────────

  async findBySchool(schoolId: number): Promise<User[]> {
    return this.userRepository.find({
      where: { school_id: schoolId },
      relations: ['school'],
    });
  }

  // ─── Lister les users par rôle dans une école ────────────────────────────────

  async findByRole(schoolId: number, role: Role): Promise<User[]> {
    return this.userRepository.find({
      where: { school_id: schoolId, role },
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: ['school'] });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['school'],
    });
    if (!user) throw new NotFoundException(`Utilisateur #${id} introuvable`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      const { password, ...rest } = updateUserDto;
      const password_hash = await bcrypt.hash(password, 10);
      Object.assign(user, { ...rest, password_hash });
    } else {
      Object.assign(user, updateUserDto);
    }

    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}