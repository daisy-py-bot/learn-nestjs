import { Controller, Post, Get, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admins')
export class AdminController {
  constructor(private readonly adminsService: AdminService) {}

  @Post()
  create(@Body() data: CreateAdminDto) {
    return this.adminsService.create(data);
  }

  @Get()
  findAll() {
    return this.adminsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminsService.findOne(id);
  }

  @Get('profile/:id')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Param('id') id: string) {
    const admin = await this.adminsService.findOne(id);
    if (!admin) return null;
    const { firstname, lastname, email, role, avatar, createdAt, lastLogin } = admin;
    return { firstname, lastname, email, role, avatar, createdAt, lastLogin };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateAdminDto) {
    return this.adminsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminsService.remove(id);
  }
}
