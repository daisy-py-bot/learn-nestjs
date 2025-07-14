import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne} from 'typeorm'
import { User } from 'src/users/user.entity'
import { Module } from 'src/modules/module.entity';
import { OneToMany } from 'typeorm';
import { FinalAssessment } from 'src/final-assessments/final-assessment.entity';

export enum CourseCategory{
    CAREER_SKILLS = 'Career Skills',
    MONEY_MATTERS = 'Money Matters',
    CATEGORY_3 = 'Category_3',
    CATEGORY_4 = 'Category_4',
    CATEGORY_5 = 'Category_5',

}

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

    @Column({type: 'enum', enum:CourseCategory})
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

    @Column('text', {array: true, nullable:  true})
    tags: string[];

    @Column({type: 'enum', enum: CourseLevel, default: CourseLevel.BEGINNER})
    level: CourseLevel

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany( () => Module, (module) => module.course)
    modules: Module[];

    @OneToMany(() => FinalAssessment, (assessment) => assessment.course)
    finalAssessments: FinalAssessment[];



}