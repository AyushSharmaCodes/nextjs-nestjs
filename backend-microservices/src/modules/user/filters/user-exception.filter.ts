import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { I18nService } from 'nestjs-i18n';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';
import { ProfileAlreadyExistsException } from '../exceptions/profile-already-exists.exception';
import { UnauthorizedRoleChangeException } from '../exceptions/unauthorized-role-change.exception';
import { ImageUploadFailedException } from '../exceptions/image-upload-failed.exception';
import { AddressNotFoundException } from '../exceptions/address-not-found.exception';
import { USER_I18N_KEYS } from '../i18n/user-i18n-keys.const';
import { ApiEnvelope } from '../response/api-envelope.response';


@Catch(
  UserNotFoundException,
  ProfileAlreadyExistsException,
  UnauthorizedRoleChangeException,
  ImageUploadFailedException,
  // Address
  AddressNotFoundException,
)
export class UserExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: Error, host: ArgumentsHost) {

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest();
    const lang = request.headers['accept-language']?.split(',')[0] || 'en';

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let messageKey = 'internal_error';
    let errorCode = 'INTERNAL_ERROR';

    if (exception instanceof UserNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      messageKey = USER_I18N_KEYS.ERRORS.NOT_FOUND;
      errorCode = 'USER_NOT_FOUND';
    } else if (exception instanceof ProfileAlreadyExistsException) {
      status = HttpStatus.CONFLICT;
      messageKey = USER_I18N_KEYS.ERRORS.PROFILE_EXISTS;
      errorCode = 'PROFILE_EXISTS';
    } else if (exception instanceof UnauthorizedRoleChangeException) {
      status = HttpStatus.FORBIDDEN;
      messageKey = USER_I18N_KEYS.ERRORS.INVALID_ROLE_SELF;
      errorCode = 'UNAUTHORIZED_ROLE_CHANGE';
    } else if (exception instanceof ImageUploadFailedException) {
      status = HttpStatus.BAD_REQUEST;
      messageKey = USER_I18N_KEYS.ERRORS.UPLOAD_FAILED;
      errorCode = 'IMAGE_UPLOAD_FAILED';
    } else if (exception instanceof AddressNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      messageKey = USER_I18N_KEYS.ERRORS.ADDRESS_NOT_FOUND;
      errorCode = 'ADDRESS_NOT_FOUND';
    }

    const translatedMessage: string = await this.i18n.translate(messageKey, { lang, defaultValue: (exception as Error).message });


    const errorResponse: ApiEnvelope<null> = {
      success: false,
      data: null,
      message: translatedMessage,
      error: {
        code: errorCode,
      },
    };

    response.status(status).send(errorResponse);
  }
}
