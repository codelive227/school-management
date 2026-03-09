import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { School } from '../../school/entities/school.entity';

export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
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

  // Stocke le refreshToken hashé — null quand l'utilisateur est déconnecté
  @Column({ type: 'text', nullable: true, default: null })
  refresh_token!: string | null;

  @ManyToOne(() => School, (school) => school.users)
  @JoinColumn({ name: 'school_id' })
  school!: School;

  @Column()
  school_id!: number;
}