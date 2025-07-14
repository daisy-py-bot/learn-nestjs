import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm';

export enum UserRole{
    LEARNER = 'learner',
    ADMIN = 'admin',
}

export enum UserStatus{
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}


@Entity()
export class User{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @Column({type: 'enum', enum: UserRole, default: UserRole.LEARNER})
    role: UserRole

    @Column({type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE})
    status: UserStatus

    @CreateDateColumn()
    createdAt: Date;

    @Column({type: 'timestamp', nullable: true})
    lastlogin: Date;

}