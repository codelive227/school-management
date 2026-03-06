import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { School } from '../../school/entities/school.entity';
import { Term } from '../../term/entities/term.entity';

@Entity()
export class AcademicYear {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  label!: string;

  @Column({ type: 'date' })
  start_date!: string;

  @Column({ type: 'date' })
  end_date!: string;

  @Column({ default: false })
  is_current!: boolean;

  @ManyToOne(() => School, (school) => school.id)
  @JoinColumn({ name: 'school_id' })
  school!: School;

  @Column()
  school_id!: number;

  @OneToMany(() => Term, (term) => term.academic_year)
  terms!: Term[];
}