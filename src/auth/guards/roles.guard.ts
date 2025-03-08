import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // console.log('User:', request.headers); // Log the user details

    // Bypass role checks if `X-Internal` header is present
    if (request.headers['x-internal-request']==="your_jwt_secret_key_change_in_production") {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // console.log('Required Roles:', requiredRoles);
    if (!requiredRoles) {
      return true;
    }

    const { user } = request;
    if (!user || !requiredRoles.some((role) => user.role === role)) {
      throw new ForbiddenException('You do not have permission to access this route.');
    }

    return true;
  }
}
