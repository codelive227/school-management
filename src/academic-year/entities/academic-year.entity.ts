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
import { School } from '../../school/entities/school.entity';
import { Term } from '../../term/entities/term.entity';

@Entity('academic_years')
export class AcademicYear {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  school_id!: number;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'school_id' })
  school!: School;

  // Ex: "2025-2026"
  @Column()
  label!: string;

  @Column({ type: 'date' })
  start_date!: Date;

  @Column({ type: 'date' })
  end_date!: Date;

  // Une seule année active à la fois par école
  @Column({ default: false })
  is_current!: boolean;

  @OneToMany(() => Term, (term) => term.academic_year)
  terms!: Term[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}