import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYear } from './entities/academic-year.entity';
import { CreateAcademicYearDto } from './dto/create-academic-year.dto';
import { UpdateAcademicYearDto } from './dto/update-academic-year.dto';


@Injectable()
export class AcademicYearService {
  constructor(@InjectRepository(AcademicYear) private readonly repo: Repository<AcademicYear>,) {}

  async create(school_id: number, dto: CreateAcademicYearDto): Promise<AcademicYear> {

    if(dto.is_current) {
      await this.repo.update({school_id: school_id}, {is_current: false});
    }
    const Year = this.repo.create({ ...dto, school_id });
    return await this.repo.save(Year);
  }

  async findAll(school_id: number): Promise<AcademicYear[]> {
    return this.repo.find({
      where: { school_id: school_id },
      relations: ['terms'],
      order: { start_date: 'DESC' },
    });
  }

  async findCurrent(school_id: number): Promise<AcademicYear> {
    const year = await this.repo.findOne({
      where: { school_id: school_id, is_current: true},
      relations: ['terms'],
    });
    if (!year) throw new NotFoundException('Aucune année scolaire active');
    return year;
  }

  async findOne(id: number, school_id: number): Promise<AcademicYear> {
    const year = await this.repo.findOne({
      where: { id, school_id: school_id },
      relations: ['terms'],
    });
    if(!year) throw new NotFoundException(`Année scolaire #${id} introuvable`);
    return year;
  }

  async update(id: number, school_id:number, dto: UpdateAcademicYearDto): Promise<AcademicYear> {
    const year = await this.findOne(id, school_id);
    if (dto.is_current) {
      await this.repo.update({ school_id: school_id}, {is_current: false });
    }
    Object.assign(year, dto);
    return this.repo.save(year);
  }

  async remove(id: number, school_id: number): Promise<void> {
    const year = await this.findOne(id, school_id);
    await this.repo.remove(year)
  }
}
