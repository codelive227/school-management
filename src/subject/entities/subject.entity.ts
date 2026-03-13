import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { School } from '../../school/entities/school.entity';
import { Classroom } from '../../classroom/entities/classroom.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  school_id!: number;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'school_id' })
  school!: School;

  @Column()
  classroom_id!: number;

  @ManyToOne(() => Classroom, (classroom) => classroom.subjects)
  @JoinColumn({ name: 'classroom_id' })
  classroom!: Classroom;

  // Ex: "Mathématiques", "Français", "SVT"
  @Column()
  name!: string;

  // Coefficient pour le calcul de la moyenne pondérée
  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1 })
  coefficient!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}