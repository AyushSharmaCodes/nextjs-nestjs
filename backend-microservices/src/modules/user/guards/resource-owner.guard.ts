import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRequest } from '../interfaces/user-request.interface';
import { UserRole } from '../types/user-role.enum';
import { I18nService } from 'nestjs-i18n';
import { USER_I18N_KEYS } from '../i18n/user-i18n-keys.const';

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(private i18n: I18nService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<UserRequest>();
    const user = request.user;
    const targetUserId = (request.params as Record<string, string>).id;

    if (!user || !targetUserId) {
      return false;
    }

    if (user.role === UserRole.ADMIN) {
      return true; // Admins bypass
    }

    if (user.id !== targetUserId) {
      const lang = request.headers['accept-language']?.split(',')[0] || 'en';
      const msg = await this.i18n.translate(USER_I18N_KEYS.ERRORS.NOT_OWNER, { lang });
      throw new ForbiddenException(msg);
    }

    return true;
  }
}
