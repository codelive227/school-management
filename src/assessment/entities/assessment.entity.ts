import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { School } from '../../school/entities/school.entity';
import { Term } from '../../term/entities/term.entity';
// import { Grade } from './grade.entity'; 

@Entity()
export class Assessment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  type!: string; // Ex: test, devoir, exam

  @Column({ type: 'date' })
  date!: string;

  @Column()
  max_score!: number;

  @ManyToOne(() => School)
  @JoinColumn({ name: 'school_id' })
  school!: School;

  @Column()
  school_id!: number;

  @Column()
  term_id!: number;

}