import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import fs from 'fs';
import path from 'path';
import { logger } from '@/shared/lib/logger';

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as (typeof routing.locales)[number])) {
    locale = routing.defaultLocale;
  }

  // Load monolithic messages first as base
  let messages = {};
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (e) {
    logger.warn('Base messages for locale {locale} not found.', { locale });
  }

  // Scan features directory to load feature-specific messages
  const featuresPath = path.join(process.cwd(), 'src/features');
  if (fs.existsSync(featuresPath)) {
    const features = fs.readdirSync(featuresPath);
    for (const feature of features) {
      const messagePath = path.join(featuresPath, feature, 'messages', `${locale}.json`);
      if (fs.existsSync(messagePath)) {
        try {
          const featureMessages = JSON.parse(fs.readFileSync(messagePath, 'utf8'));
          // Namespace feature translations under feature name
          messages = {
            ...messages,
            [feature]: featureMessages
          };
        } catch (err) {
          logger.error('Failed to parse messages for feature {feature} in locale {locale}: {error}', { 
            feature, 
            locale, 
            error: err instanceof Error ? err.message : String(err) 
          });
        }
      }
    }
  }

  return {
    locale,
    messages
  };
});
