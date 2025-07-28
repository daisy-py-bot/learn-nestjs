import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() data: RegisterDto) {
    return this.authService.register(data);
  }

  @Post('admin/register')
  registerAdmin(@Body() data: RegisterDto) {
    return this.authService.register({ ...data, isAdmin: true });
  }

  @Post('login')
  login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }

  @Post('admin/login')
  adminLogin(@Body() data: LoginDto) {
    return this.authService.adminLogin(data);
  }
}
