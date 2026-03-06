import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AcademicYear } from '../../academic-year/entities/academic-year.entity';
import { Assessment } from '../../assessment/entities/assessment.entity';

@Entity()
export class Term {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  label!: string; //Trim 1/2/3

  @Column({ type: 'date' })
  start_date!: string;

  @Column({ type: 'date' })
  end_date!: string; 

  @ManyToOne(() => AcademicYear, (year) => year.terms)
  @JoinColumn({ name: 'academic_year_id' })
  academic_year!: AcademicYear;

  @Column()
  academic_year_id!: number;

  @OneToMany(() => Assessment, (assessment) => assessment.term)
  assessments!: Assessment[];
}