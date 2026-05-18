import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { PermissionsService } from '../services/permissions.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true; // No permissions required
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.id) {
      return false; // Not authenticated
    }

    // Example user.id is populated by JwtAuthGuard
    const userPermissions = await this.permissionsService.getUserPermissions(user.id);
    
    // For simplicity, requiring ALL specified permissions
    // Alternatively, this can be `some()` depending on logic
    return requiredPermissions.every((permission) => userPermissions.includes(permission));
  }
}
