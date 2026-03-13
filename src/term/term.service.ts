import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Term } from './entities/term.entity';
import { CreateTermDto } from './dto/create-term.dto';
import { UpdateTermDto } from './dto/update-term.dto';

@Injectable()
export class TermService {
  constructor(
    @InjectRepository(Term)
    private readonly repo: Repository<Term>,
  ) {}

  // USA02 : ADMIN crée un trimestre
  async create(dto: CreateTermDto): Promise<Term> {
    const term = this.repo.create(dto);
    return this.repo.save(term);
  }

  // Lister les trimestres d'une année scolaire
  async findByAcademicYear(academicYearId: number): Promise<Term[]> {
    return this.repo.find({
      where: { academic_year_id: academicYearId },
      order: { start_date: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Term> {
    const term = await this.repo.findOne({
      where: { id },
      relations: ['academic_year'],
    });
    if (!term) throw new NotFoundException(`Trimestre #${id} introuvable`);
    return term;
  }

  async update(id: number, dto: UpdateTermDto): Promise<Term> {
    const term = await this.findOne(id);
    Object.assign(term, dto);
    return this.repo.save(term);
  }

  async remove(id: number): Promise<void> {
    const term = await this.findOne(id);
    await this.repo.remove(term);
  }
}