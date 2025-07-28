import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AdminService } from 'src/admin/admin.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { ActionType } from '../activity-logs/activity-log.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private adminService: AdminService,
    private jwtService: JwtService,
    private activityLogsService: ActivityLogsService,
  ) {}

  async register(data: RegisterDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    // Check if this is an admin registration
    if (data.isAdmin) {
      const admin = await this.adminService.create({
        ...data,
        password: hashedPassword,
      });
      const payload = { sub: admin.id, email: admin.email, role: admin.role, isAdmin: true };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } else {
      const user = await this.usersService.create({
        ...data,
        password: hashedPassword,
      });
      const payload = { sub: user.id, email: user.email, isAdmin: false };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
  }

  async login(data: LoginDto) {
    // Only try user login for regular login endpoint
    const user = await this.usersService.findByEmail(data.email);
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login timestamp
    await this.usersService.updateLastLogin(user.id);

    // Log login activity
    await this.activityLogsService.create({
      userId: user.id,
      actionType: ActionType.LOGIN,
      metadata: { email: user.email, isAdmin: false },
    });

    const payload = { sub: user.id, email: user.email, isAdmin: false };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async adminLogin(data: LoginDto) {
    // Only try admin login for admin login endpoint
    console.log('Admin login attempt for email:', data.email);
    const admin = await this.adminService.findOneByEmail(data.email);
    console.log('Admin found:', admin);
    if (!admin || !(await bcrypt.compare(data.password, admin.password))) {
      throw new UnauthorizedException('Invalid admin credentials');
    }

    await this.adminService.update(admin.id, { lastLogin: new Date() });

    // // Log login activity
    // await this.activityLogsService.create({
    //   userId: admin.id,
    //   actionType: ActionType.LOGIN,
    //   metadata: { email: admin.email, isAdmin: true },
    // });

    const payload = { sub: admin.id, email: admin.email, role: admin.role, isAdmin: true };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
