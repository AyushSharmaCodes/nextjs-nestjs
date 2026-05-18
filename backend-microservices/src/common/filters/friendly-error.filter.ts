import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from 'nestjs-pino';

@Catch()
export class FriendlyErrorFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Ignore if not HTTP context
    if (!response || !response.status) {
      return;
    }

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const traceId = (request as any).traceId || null;
    const correlationId = (request as any).correlationId || null;

    const exceptionResponse = exception instanceof HttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    const message = typeof exceptionResponse === 'string'
      ? exceptionResponse
      : (exceptionResponse as Record<string, unknown>).message || 'Internal server error';

    // Log the error
    if (status >= 500) {
      this.logger.error({
        err: exception,
        path: request.url,
        method: request.method,
        traceId,
        correlationId,
      }, 'Technical Error');
    } else {
      this.logger.warn({
        msg: message,
        path: request.url,
        method: request.method,
        statusCode: status,
        traceId,
        correlationId,
      });
    }

    // Determine structured details for validation or general errors
    let details: { message: string; field: string | null; code: string | null }[] | undefined = undefined;
    let responseMessage = 'An unexpected error occurred';
    
    // Extract custom error code if present
    const customErrorCode = typeof exceptionResponse === 'object' && exceptionResponse !== null
      ? (exceptionResponse as Record<string, unknown>).error
      : undefined;

    let errorCode = typeof customErrorCode === 'string' ? customErrorCode : 'INTERNAL_SERVER_ERROR';

    if (status < 500) {
      if (!customErrorCode) {
        if (status === HttpStatus.BAD_REQUEST) {
          errorCode = '400';
          if (Array.isArray(message)) {
            errorCode = '400';
            responseMessage = 'Validation failed';
            details = message.map((msg: string) => {
              const firstWord = msg.split(' ')[0];
              return {
                message: msg,
                field: firstWord || null,
                code: 'INVALID_FIELD',
              };
            });
          } else {
            responseMessage = typeof message === 'string' ? message : 'Bad request';
          }
        } else if (status === HttpStatus.UNAUTHORIZED) {
          errorCode = '401';
          responseMessage = typeof message === 'string' ? message : 'Unauthorized access';
        } else if (status === HttpStatus.FORBIDDEN) {
          errorCode = '403';
          responseMessage = typeof message === 'string' ? message : 'Access denied';
        } else if (status === HttpStatus.NOT_FOUND) {
          errorCode = '404';
          responseMessage = typeof message === 'string' ? message : 'Resource not found';
        } else {
          errorCode = '400';
          responseMessage = typeof message === 'string' ? message : 'An error occurred';
        }
      } else {
        responseMessage = typeof message === 'string' ? message : 'An error occurred';
      }
    } else {
      errorCode = typeof customErrorCode === 'string' ? customErrorCode : '500';
      responseMessage = 'Internal server error';
    }

    // Format consistent response strictly matching ApiResponseShape
    response.status(status).json({
      success: false,
      message: responseMessage,
      error: errorCode,
      details,
      meta: traceId ? { traceId, ...(correlationId ? { correlationId } : {}) } : undefined,
    });
  }
}
