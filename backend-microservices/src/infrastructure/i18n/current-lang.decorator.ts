import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

/**
 * Extracts the current language from the i18n context.
 * Usage: @CurrentLang() lang: string
 */
export const CurrentLang = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const i18n = I18nContext.current(ctx);
    return i18n?.lang || 'en';
  },
);
