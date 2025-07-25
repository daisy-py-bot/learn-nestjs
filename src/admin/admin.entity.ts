import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
  } from 'typeorm';
  
  export enum AdminRole {
    ADMIN = 'admin',
    SUPER_ADMIN = 'super_admin',
  }

  
  @Entity()
  export class Admin {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    firstname: string;
  
    @Column()
    lastname: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string;
  
    @Column({ type: 'enum', enum: AdminRole, default: AdminRole.ADMIN })
    role: AdminRole;
  
    @Column({ nullable: true })
    avatar?: string;
  
    @Column({ default: true })
    active: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @Column({ type: 'timestamp', nullable: true })
    lastLogin: Date;
    
  }
  