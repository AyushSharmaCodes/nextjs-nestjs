import { Module, Global } from '@nestjs/common';
import {
  I18nModule,
  QueryResolver,
  HeaderResolver,
  CookieResolver,
  AcceptLanguageResolver,
} from 'nestjs-i18n';
import * as path from 'path';

import { AppConfigService } from '../config/app-config.service';

/**
 * Centralized i18n module.
 * Merged locales from all services into a single locales directory.
 *
 * Detection order: ?lang= → X-User-Lang → Cookie 'lang' → Accept-Language
 */
@Global()
@Module({
  imports: [
    I18nModule.forRootAsync({
      useFactory: (cfg: AppConfigService) => ({
        fallbackLanguage: 'en',
        loaderOptions: {
          path: path.join(__dirname, 'locales'),
          watch: !cfg.isProduction,
        },
        resolvers: [
          new QueryResolver(['lang']),
          new HeaderResolver(['x-user-lang']),
          new CookieResolver(['lang']),
          new AcceptLanguageResolver(),
        ],
        typesOutputPath: !cfg.isProduction
          ? path.join(process.cwd(), 'src', 'generated', 'i18n.generated.ts')
          : undefined,
      }),
      inject: [AppConfigService],
    }),
  ],
  exports: [I18nModule],
})
export class AppI18nModule {}
