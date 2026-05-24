import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserRequest } from '../interfaces/user-request.interface';
import { UserRepository } from '../user.repository';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly userRepository: UserRepository) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<UserRequest>();

    return next.handle().pipe(
      tap(async () => {
        const user = request.user;
        const method = request.method;
        const url = request.url;

        if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
          const action = `${method} ${url}`;
          const targetId = (request.params as Record<string, string>).id || null;

          let actorId = null;
          if (user) {
            const profile = await this.userRepository.findProfileByUserId(user.id);
            if (profile) actorId = profile.id;
          }

          await this.userRepository
            .logAudit({
              actorId,
              targetId,
              action,
              payload: request.body as object,
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
            })
            .catch(err => {
              this.logger.error('Failed to log audit event', err);
            });
        }
      }),
    );
  }
}
