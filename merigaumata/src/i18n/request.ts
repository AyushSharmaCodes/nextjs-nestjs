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
  } catch (e: unknown) {
    logger.warn('Base messages for locale {locale} not found.', { locale });
  }

  // Scan features directory to load feature-specific messages
  const featuresPath = path.join(process.cwd(), 'src/features');
  try {
    const features = await fs.promises.readdir(featuresPath);
    for (const feature of features) {
      const messagePath = path.join(featuresPath, feature, 'messages', `${locale}.json`);
      try {
        const fileContent = await fs.promises.readFile(messagePath, 'utf8');
        const featureMessages = JSON.parse(fileContent);
        // Namespace feature translations under feature name
        messages = {
          ...messages,
          [feature]: featureMessages
        };
      } catch (err: any) { // ts-audit-ignore
        // Ignore ENOENT (file not found), log actual parsing/read errors
        if (err.code !== 'ENOENT') {
          logger.error('Failed to parse messages for feature {feature} in locale {locale}: {error}', { 
            feature, 
            locale, 
            error: err instanceof Error ? err.message : String(err) 
          });
        }
      }
    }
  } catch (err: any) { // ts-audit-ignore
    // Ignore ENOENT if the features directory does not exist yet
    if (err.code !== 'ENOENT') {
      logger.warn('Failed to read features directory: {error}', { error: err.message });
    }
  }

  return {
    locale,
    messages
  };
});
