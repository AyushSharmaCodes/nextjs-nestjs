import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { EmailTemplate, EmailQueue } from './entities/email.entity';
import { isSupportedLanguage } from '../../../common/types';
import { MailService } from '../../../infrastructure/mail/mail.service';

@Injectable()
export class EmailService {
  constructor(
    @InjectRepository(EmailTemplate) private templateRepo: Repository<EmailTemplate>,
    @InjectRepository(EmailQueue) private queueRepo: Repository<EmailQueue>,
    private config: ConfigService,
    private i18n: I18nService,
    private mailService: MailService,
  ) {}

  /** Queue a raw email (subject + html already resolved by caller). */
  async sendEmail(to: string, subject: string, html: string, text?: string) {
    let status = 'PENDING';
    
    try {
      await this.mailService.sendMail({ to, subject, html, text });
      status = 'SENT';
    } catch (e) {
      status = 'FAILED';
    }

    const email = this.queueRepo.create({
      toEmail: to,
      subject,
      htmlBody: html,
      textBody: text,
      status,
      sentAt: status === 'SENT' ? new Date() : undefined,
    });
    await this.queueRepo.save(email);
    return { queued: true, id: email.id, status };
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
    data: Record<string, string | number | boolean | null> = {},
    lang = 'en',
  ) {
    const template = await this.templateRepo.findOne({
      where: { templateKey, isActive: true },
    });
    if (!template) return { error: 'Template not found' };

    // Resolve the subject via i18n if the template has a subject_i18n_key
    const resolvedLang = isSupportedLanguage(lang) ? lang : 'en';
    let subject = template.subject ?? templateKey;

    if (template.subjectI18nKey) {
      try {
        subject = await this.i18n.translate(template.subjectI18nKey, {
          lang: resolvedLang,
          args: data,
        });
      } catch {
        // Fallback to raw subject if translation key is missing
      }
    }

    let status = 'PENDING';
    try {
      await this.mailService.sendMail({ 
        to, 
        subject, 
        html: '', // For proper template support, this would render HTML from DB or files. 
        text: ''
      });
      status = 'SENT';
    } catch (e) {
      status = 'FAILED';
    }

    const email = this.queueRepo.create({
      toEmail: to,
      templateKey,
      templateData: data,
      subject,
      status,
      sentAt: status === 'SENT' ? new Date() : undefined,
    });
    await this.queueRepo.save(email);
    return { sent: status === 'SENT', status };
  }

  /** Translate a single key — useful for notification bodies in other services. */
  async translate(key: string, lang = 'en', args?: Record<string, string | number | boolean | null>): Promise<string> {
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