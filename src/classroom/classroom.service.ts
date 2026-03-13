import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classroom } from './entities/classroom.entity';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(Classroom)
    private readonly repo: Repository<Classroom>,
  ) {}

  // USA03 : ADMIN crée une classe
  async create(schoolId: number, dto: CreateClassroomDto): Promise<Classroom> {
    const classroom = this.repo.create({ ...dto, school_id: schoolId });
    return this.repo.save(classroom);
  }

  // Lister les classes d'une école — filtre optionnel par année scolaire
  async findAll(schoolId: number, academicYearId?: number): Promise<Classroom[]> {
    const where: any = { school_id: schoolId };
    if (academicYearId) where.academic_year_id = academicYearId;

    return this.repo.find({
      where,
      relations: ['academic_year', 'subjects'],
      order: { cycle: 'ASC', level: 'ASC' },
    });
  }

  async findOne(id: number, schoolId: number): Promise<Classroom> {
    const classroom = await this.repo.findOne({
      where: { id, school_id: schoolId },
      relations: ['academic_year', 'subjects'],
    });
    if (!classroom) throw new NotFoundException(`Classe #${id} introuvable`);
    return classroom;
  }

  async update(id: number, schoolId: number, dto: UpdateClassroomDto): Promise<Classroom> {
    const classroom = await this.findOne(id, schoolId);
    Object.assign(classroom, dto);
    return this.repo.save(classroom);
  }

  async remove(id: number, schoolId: number): Promise<void> {
    const classroom = await this.findOne(id, schoolId);
    await this.repo.remove(classroom);
  }
}