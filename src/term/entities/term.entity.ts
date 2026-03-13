import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AcademicYear } from '../../academic-year/entities/academic-year.entity';

export enum TermLabel {
  TRIM1 = 'Trimestre 1',
  TRIM2 = 'Trimestre 2',
  TRIM3 = 'Trimestre 3',
}

@Entity('terms')
export class Term {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  academic_year_id!: number;

  @ManyToOne(() => AcademicYear, (ay) => ay.terms)
  @JoinColumn({ name: 'academic_year_id' })
  academic_year!: AcademicYear;

  @Column({
    type: 'enum',
    enum: TermLabel,
  })
  label!: TermLabel;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  end_date!: Date;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}