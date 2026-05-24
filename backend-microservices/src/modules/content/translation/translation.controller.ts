import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { TranslationService } from './translation.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { SupportedLanguage, isSupportedLanguage } from '../../../common/types';
import { CurrentLang } from '../../../infrastructure/i18n/current-lang.decorator';

@Controller('translations')
export class TranslationController {
  constructor(
    private readonly service: TranslationService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * GET /translations
   * Retrieves DB-backed translations for the given language + optional namespace.
   * Falls back to file-based i18n JSON if DB returns nothing.
   */
  @Get()
  async getTranslations(
    @Query('language') language: string,
    @Query('namespace') namespace?: string,
    @CurrentLang() detectedLang?: SupportedLanguage,
  ) {
    const lang = isSupportedLanguage(language) ? language : (detectedLang ?? 'en');
    const dbTranslations = await this.service.getTranslations(lang, namespace);

    // If the DB has translations, return them; otherwise serve from file-based i18n
    if (Object.keys(dbTranslations).length > 0) {
      return ApiResponse.success(dbTranslations);
    }

    // Fallback: return all file-based keys for the requested language
    const allKeys = await this.i18n.translate('', { lang });
    return ApiResponse.success(allKeys);
  }

  /**
   * GET /translations/languages
   * Lists all available languages from the DB (active ones only).
   */
  @Get('languages')
  async getLanguages() {
    return ApiResponse.success(await this.service.getLanguages());
  }

  /**
   * POST /translations/languages
   * Registers a new supported language.
   */
  @Post('languages')
  async addLanguage(@Body() body: { language: string; name: string; isDefault?: boolean }) {
    return ApiResponse.success(await this.service.addLanguage(body), 'Language added');
  }

  /**
   * PUT /translations/languages/:id
   * Updates a language record (e.g., mark as default, rename).
   */
  @Put('languages/:id')
  async updateLanguage(@Param('id') id: string, @Body() body: any) { // ts-audit-ignore
    return ApiResponse.success(await this.service.updateLanguage(id, body));
  }

  /**
   * POST /translations/bulk
   * Upserts many key-value translations for a language/namespace.
   */
  @Post('bulk')
  async bulkSet(
    @Body() body: { language: string; namespace: string; translations: Record<string, string> },
  ) {
    return ApiResponse.success(
      await this.service.bulkSet(body.language, body.namespace, body.translations),
      'Translations saved',
    );
  }

  /**
   * PUT /translations/:id
   * Updates a single translation value by its DB ID.
   */
  @Put(':id')
  async setTranslation(@Param('id') id: string, @Body() body: { value: string }) {
    const trans = await this.service.updateTranslationValue(id, body.value);
    if (!trans) return ApiResponse.error('Translation not found');
    return ApiResponse.success(trans);
  }

  /**
   * DELETE /translations/:id
   * Removes a translation entry.
   */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.deleteTranslation(id);
    return ApiResponse.success(null, 'Translation deleted');
  }
}