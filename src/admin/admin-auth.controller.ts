import { Controller, Post, Body } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('register')
  register(@Body() data: CreateAdminDto) {
    return this.adminAuthService.register(data);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.adminAuthService.login(body.email, body.password);
  }
} 