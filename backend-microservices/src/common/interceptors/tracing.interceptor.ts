import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger as PinoLogger } from 'nestjs-pino';
import * as crypto from 'crypto';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  constructor(private readonly logger: PinoLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const traceId =
      req.headers['x-trace-id'] || req.headers['X-Trace-Id'] || crypto.randomUUID();
    const correlationId =
      req.headers['x-correlation-id'] || req.headers['X-Correlation-Id'] || traceId;
    const spanId = crypto.randomBytes(8).toString('hex');
    const parentSpanId = req.headers['x-span-id'] || req.headers['X-Span-Id'] || null;

    // Attach to request for downstream access
    req.traceId = traceId;
    req.correlationId = correlationId;
    req.spanId = spanId;
    req.parentSpanId = parentSpanId;

    // Set response headers
    res.header('X-Trace-Id', traceId);
    res.header('X-Correlation-Id', correlationId);
    res.header('X-Span-Id', spanId);
    if (parentSpanId) {
      res.header('X-Parent-Span-Id', parentSpanId);
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - startTime;
          const status = res.statusCode;
          const msg = `${req.method} ${req.originalUrl || req.url} ${status} ${durationMs}ms`;

          if (status >= 500) this.logger.error({ traceId, correlationId, spanId, method: req.method, url: req.originalUrl || req.url, statusCode: status, durationMs }, 'Request failed');
          else if (status >= 400) this.logger.warn({ traceId, correlationId, spanId, method: req.method, url: req.originalUrl || req.url, statusCode: status, durationMs }, 'Client error');
          else this.logger.log({ traceId, correlationId, spanId, method: req.method, url: req.originalUrl || req.url, statusCode: status, durationMs });
        },
        error: (err) => {
          const durationMs = Date.now() - startTime;
          this.logger.error({ traceId, correlationId, spanId, method: req.method, url: req.originalUrl || req.url, durationMs }, `Request error: ${err?.message}`);
        },
      }),
    );
  }
}
