import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable} from 'typeorm';
import { Badge } from 'src/badges/badge.entity';



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

    @Column({type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE})
    status: UserStatus

    @CreateDateColumn()
    createdAt: Date;

    @Column({type: 'timestamp', nullable: true})
    lastlogin: Date;

    @ManyToMany(() => Badge, (badge) => badge.users)
    @JoinTable()
    badges: Badge[];


}