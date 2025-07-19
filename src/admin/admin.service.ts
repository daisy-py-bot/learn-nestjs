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

  create(data: CreateAdminDto) {
    const admin = this.adminRepo.create(data);
    return this.adminRepo.save(admin);
  }

  findAll() {
    return this.adminRepo.find();
  }

  findOne(id: string) {
    return this.adminRepo.findOne({ where: { id } });
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
