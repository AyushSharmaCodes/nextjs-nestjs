import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'hi', 'ta', 'te'],
  defaultLocale: 'en'
});
