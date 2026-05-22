import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../types/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRequest } from '../interfaces/user-request.interface';
import { I18nService } from 'nestjs-i18n';
import { USER_I18N_KEYS } from '../i18n/user-i18n-keys.const';
import { UserRepository } from '../user.repository';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private i18n: I18nService,
    private userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<UserRequest>();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Verify role against database, not just JWT
    const profile = await this.userRepository.findProfileByUserId(user.id);
    if (!profile) {
      return false;
    }

    const userRole = profile.role.name as UserRole;

    if (!requiredRoles.includes(userRole)) {
      const lang = request.headers['accept-language']?.split(',')[0] || 'en';
      const msg = await this.i18n.translate(USER_I18N_KEYS.ERRORS.FORBIDDEN, { lang });
      throw new ForbiddenException(msg);
    }

    return true;
  }
}
