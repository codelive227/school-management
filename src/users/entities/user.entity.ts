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

export enum Role {
  ADMIN   = 'ADMIN',
  TEACHER = 'TEACHER',
  PARENT  = 'PARENT',
  STUDENT = 'STUDENT',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.STUDENT,
  })
  role!: Role;

  // Refresh token hashé — null = déconnecté
  @Column({ type: 'text', nullable: true, default: null })
  refresh_token!: string | null;

  // Relation école — nullable pour les super-admins système
  @ManyToOne(() => School, (school) => school.users, { nullable: true })
  @JoinColumn({ name: 'school_id' })
  school!: School;

  @Column({ nullable: true })
  school_id!: number;

  
  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}