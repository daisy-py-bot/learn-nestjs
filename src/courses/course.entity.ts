import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable, OneToMany} from 'typeorm'
import { User } from 'src/users/user.entity'
import { Module } from 'src/modules/module.entity';
import { Badge } from 'src/badges/badge.entity';
import { Certificate } from 'src/certificates/certificate.entity';
import { FinalAssessment } from 'src/final-assessments/final-assessment.entity';
import { CourseCategory } from './course-category.entity';

export enum CourseLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}


@Entity()
export class Course{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @ManyToOne(() => CourseCategory, { nullable: false })
    category: CourseCategory;

    @Column('text')
    description: string;
    
    @Column('int')
    duration: number; //minutes

    @ManyToOne(() => User)
    createdBy: User;

    @Column({nullable:true})
    thumbnailUrl: string;

    @Column({default: false})
    isPublished: boolean;

    @ManyToOne( () => Course, {nullable: true})
    prerequisites: Course;

    @Column('text', { array: true, nullable: true })
    objectives: string[];

    @Column('text', { array: true, nullable: true })
    searchTags: string[];

    @Column('text', { array: true, nullable: true })
    badgeNames: string[];

    @Column({type: 'enum', enum: CourseLevel, default: CourseLevel.BEGINNER})
    level: CourseLevel

    @ManyToMany(() => Badge)
    @JoinTable()
    badges: Badge[];

    @Column({ default: false })
    hasCertificate: boolean;

    @OneToMany(() => FinalAssessment, (fa) => fa.course)
    finalAssessments: FinalAssessment[];

    @OneToMany(() => Module, (module) => module.course)
    modules: Module[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

}