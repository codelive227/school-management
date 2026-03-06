import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, JoinColumn, ManyToOne } from "typeorm";
import { School } from "src/school/entities/school.entity";
import { AcademicYear } from "src/academic-year/entities/academic-year.entity";
@Entity()
export class Classroom {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    cycle!: string

    @Column()
    level!: string

    @Column()
    capacity!: number

    @ManyToOne(() => School, (School) => School.classrooms)
    @JoinColumn({ name: 'school_id' })
    school!: School;

    @Column()
    school_id!: number
}
