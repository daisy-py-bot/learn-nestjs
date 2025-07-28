import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class AdminAuthGuard extends JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First check if JWT is valid
    const isJwtValid = await super.canActivate(context);
    if (!isJwtValid) {
      return false;
    }

    // Then check if user is admin
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user && user.isAdmin === true;
  }
} 