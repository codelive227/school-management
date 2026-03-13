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
import { AcademicYear } from '../../academic-year/entities/academic-year.entity';
import { Subject } from '../../subject/entities/subject.entity';

// Cycles du système nigérien
export enum Cycle {
  PRESCOLAIRE = 'prescolaire',   // 3-5 ans
  PRIMAIRE    = 'primaire',      // CI → CM2 (6 ans)
  COLLEGE     = 'college',       // 6ème → 3ème (4 ans)
  LYCEE       = 'lycee',         // 2nde → Terminale (3 ans)
}

// Niveaux par cycle
export enum Level {
  // Préscolaire
  PETITE_SECTION  = 'Petite Section',
  MOYENNE_SECTION = 'Moyenne Section',
  GRANDE_SECTION  = 'Grande Section',
  // Primaire
  CI   = 'CI',
  CP   = 'CP',
  CE1  = 'CE1',
  CE2  = 'CE2',
  CM1  = 'CM1',
  CM2  = 'CM2',
  // Collège
  SIXIEME  = '6ème',
  CINQUIEME = '5ème',
  QUATRIEME = '4ème',
  TROISIEME = '3ème',
  // Lycée
  SECONDE   = '2nde',
  PREMIERE  = '1ère',
  TERMINALE = 'Terminale',
}

@Entity('classrooms')
export class Classroom {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  school_id!: number;

  @ManyToOne(() => School, (school) => school.classrooms)
  @JoinColumn({ name: 'school_id' })
  school!: School;

  @Column()
  academic_year_id!: number;

  @ManyToOne(() => AcademicYear)
  @JoinColumn({ name: 'academic_year_id' })
  academic_year!: AcademicYear;

  // Ex: "6ème A", "CM2 B"
  @Column()
  name!: string;

  @Column({ type: 'enum', enum: Cycle })
  cycle!: Cycle;

  @Column({ type: 'enum', enum: Level })
  level!: Level;

  @Column({ nullable: true })
  capacity!: number;

  @OneToMany(() => Subject, (subject) => subject.classroom)
  subjects!: Subject[];

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}