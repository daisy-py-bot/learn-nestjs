import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthController } from './admin-auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin]),
    JwtModule.register({
      secret: 'hardcoded_secret_key', // Use the same secret as user auth
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AdminService, AdminAuthService],
  controllers: [AdminController, AdminAuthController],
  exports: [AdminService],
})
export class AdminModule {}
