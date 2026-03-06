import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from './entities/school.entity';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolService {
  constructor(
    @InjectRepository(School) private schoolRepo: Repository<School>,
  ) {}

  async create(dto: CreateSchoolDto) {
    const school = this.schoolRepo.create(dto);
    return this.schoolRepo.save(school);
  }

  async findAll() {
    return this.schoolRepo.find({ relations: ['users', 'classrooms'] });
  }

  async findOne(id: number) {
    return this.schoolRepo.findOne({ where: { id }, relations: ['users', 'classrooms'] });
  }

  async update(id: number, dto: UpdateSchoolDto) {
    await this.schoolRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    return this.schoolRepo.delete(id);
  }
}
