import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActionType } from '../activity-logs/activity-log.entity';

@Injectable()
export class AdminAuthService {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService,
    private activityLogsService: ActivityLogsService,
  ) {}

  async register(data: CreateAdminDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const admin = await this.adminService.create({
      ...data,
      password: hashedPassword,
    });
    const payload = { sub: admin.id, email: admin.email, role: admin.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(email: string, password: string) {
    const admin = await this.adminService.findOneByEmail(email);
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.adminService.update(admin.id, { lastLogin: new Date() });

    // Log login activity
    await this.activityLogsService.create({
      userId: admin.id,
      actionType: ActionType.LOGIN,
      metadata: { email: admin.email, isAdmin: true },
    });

    const payload = { sub: admin.id, email: admin.email, role: admin.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
} 