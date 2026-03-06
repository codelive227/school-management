import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Classroom } from '../../classroom/entities/classroom.entity'
@Entity()
export class School {
  @PrimaryGeneratedColumn()
  id!: number;  

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column({ nullable: true })
  logo_url!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column("simple-array")
  cycles!: string[];

  @Column("json", { nullable: true })
  settings!: Record<string, any>;

  @OneToMany(() => User, (user) => user.school)
  users!: User[];

@OneToMany(() => Classroom, (classroom: Classroom) => classroom.school)
classrooms!: Classroom[];
}