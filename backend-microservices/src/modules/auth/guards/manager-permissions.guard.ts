import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ManagerService } from '../../user/manager/manager.service';

@Injectable()
export class ManagerPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly managerService: ManagerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { id?: string; role?: string } | undefined;

    if (!user?.id || !user.role) {
      throw new ForbiddenException('Permission denied');
    }

    if (user.role === 'ADMIN') {
      return true;
    }

    if (user.role !== 'MANAGER') {
      throw new ForbiddenException('Permission denied');
    }

    const hasAnyPermission = await this.managerService.hasAnyPermission(
      user.id,
      requiredPermissions,
    );

    if (!hasAnyPermission) {
      throw new ForbiddenException('Permission denied');
    }

    return true;
  }
}
