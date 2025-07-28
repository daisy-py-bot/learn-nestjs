import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
  ) {}

  async create(data: CreateAdminDto) {
    const admin = this.adminRepo.create(data);
    return this.adminRepo.save(admin);
  }

  findAll() {
    return this.adminRepo.find();
  }

  findOne(id: string) {
    return this.adminRepo.findOne({ where: { id } });
  }

  async findOneByEmail(email: string) {
    console.log('Looking for admin with email:', email);
    const admin = await this.adminRepo.findOne({ where: { email } });
    console.log('Found admin:', admin);
    return admin;
  }

  async update(id: string, updates: UpdateAdminDto) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new NotFoundException('Admin not found');
    Object.assign(admin, updates);
    return this.adminRepo.save(admin);
  }

  async remove(id: string) {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) throw new NotFoundException('Admin not found');
    return this.adminRepo.remove(admin);
  }
}
