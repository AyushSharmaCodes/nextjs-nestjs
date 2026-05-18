import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { EmailTemplate, EmailQueue } from './entities/email.entity';
import { isSupportedLanguage } from '../../../common/types';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailTemplate) private templateRepo: Repository<EmailTemplate>,
    @InjectRepository(EmailQueue) private queueRepo: Repository<EmailQueue>,
    private config: ConfigService,
    private i18n: I18nService,
  ) {}

  /** Queue a raw email (subject + html already resolved by caller). */
  async sendEmail(to: string, subject: string, html: string, text?: string) {
    const email = this.queueRepo.create({
      toEmail: to,
      subject,
      htmlBody: html,
      textBody: text,
      status: 'PENDING',
    });
    await this.queueRepo.save(email);
    return { queued: true, id: email.id };
  }

  /**
   * Queue a templated email, resolving the subject via i18n if a translation
   * key is configured on the template record.
   *
   * @param to          Recipient email address
   * @param templateKey Key of the active EmailTemplate record
   * @param data        Interpolation variables for the template
   * @param lang        Preferred language (from request context / user profile)
   */
  async sendTemplatedEmail(
    to: string,
    templateKey: string,
    data: Record<string, unknown> = {},
    lang = 'en',
  ) {
    const template = await this.templateRepo.findOne({
      where: { templateKey, isActive: true },
    });
    if (!template) return { error: 'Template not found' };

    // Resolve the subject via i18n if the template has a subject_i18n_key
    const resolvedLang = isSupportedLanguage(lang) ? lang : 'en';
    let subject = template.subject ?? templateKey;

    if ((template as any).subjectI18nKey) {
      try {
        subject = await this.i18n.translate((template as any).subjectI18nKey, {
          lang: resolvedLang,
          args: data,
        });
      } catch {
        // Fallback to raw subject if translation key is missing
      }
    }

    const email = this.queueRepo.create({
      toEmail: to,
      templateKey,
      templateData: data,
      subject,
      status: 'SENT',
      sentAt: new Date(),
    });
    await this.queueRepo.save(email);
    return { sent: true };
  }

  /** Translate a single key — useful for notification bodies in other services. */
  async translate(key: string, lang = 'en', args?: Record<string, unknown>): Promise<string> {
    const resolvedLang = isSupportedLanguage(lang) ? lang : 'en';
    return this.i18n.translate(key, { lang: resolvedLang, args });
  }

  async createTemplate(data: any) {
    return this.templateRepo.save(this.templateRepo.create(data));
  }

  async getTemplates() {
    return this.templateRepo.find({ where: { isActive: true } });
  }
}