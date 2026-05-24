import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  userId?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private sesClient: SESClient | null = null;

  constructor(
    private configService: ConfigService,
  ) {
    this.initializeProvider();
  }

  private initializeProvider() {
    const provider = this.configService.get<string>('MAIL_PROVIDER', 'console').toLowerCase();

    if (provider === 'ses') {
      // Initialize Amazon SES
      this.logger.log('Initializing Amazon SES for email delivery');
      this.sesClient = new SESClient({
        region: this.configService.get<string>('AWS_REGION'),
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
        },
      });
    } else if (provider === 'smtp') {
      // Initialize SMTP
      const smtpHost = this.configService.get<string>('SMTP_HOST');
      if (smtpHost) {
        this.logger.log(`Initializing SMTP transport for email delivery via ${smtpHost}`);
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: this.configService.get<number>('SMTP_PORT', 1025),
          secure: this.configService.get<string>('SMTP_SECURE', 'false') === 'true',
          auth: this.configService.get<string>('SMTP_USER') ? {
            user: this.configService.get<string>('SMTP_USER'),
            pass: this.configService.get<string>('SMTP_PASS'),
          } : undefined, // Useful for local mailpit without auth
        });
      } else {
        this.logger.error('MAIL_PROVIDER is smtp but SMTP_HOST is not configured');
      }
    } else {
      this.logger.log('Initializing Console transport for email delivery');
    }
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const provider = this.configService.get<string>('MAIL_PROVIDER', 'console').toLowerCase();
    const from = this.configService.get<string>('MAIL_FROM', 'noreply@merigaumata.com');

    if (provider === 'ses' && this.sesClient) {
      try {
        const command = new SendEmailCommand({
          Destination: { ToAddresses: [options.to] },
          Message: {
            Body: {
              ...(options.html && { Html: { Charset: 'UTF-8', Data: options.html } }),
              ...(options.text && { Text: { Charset: 'UTF-8', Data: options.text } }),
            },
            Subject: { Charset: 'UTF-8', Data: options.subject },
          },
          Source: from,
        });
        await this.sesClient.send(command);
        this.logger.log(`Sent email to ${options.to} via SES`);
      } catch (error: unknown) {
        this.logger.error(`Failed to send email to ${options.to} via SES`, error);
      }
    } else if (provider === 'smtp' && this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          ...options,
        });
        this.logger.log(`Sent email to ${options.to} via SMTP`);
      } catch (error: unknown) {
        this.logger.error(`Failed to send email to ${options.to} via SMTP`, error);
      }
    } else {
      // Console mock transport
      this.logger.log('--- NEW EMAIL LOG ---');
      this.logger.log(`To: ${options.to}`);
      this.logger.log(`Subject: ${options.subject}`);
      if (options.text) this.logger.log(`Text: ${options.text}`);
      if (options.html) this.logger.log(`Html: ${options.html}`);
      this.logger.log('---------------------');
    }
  }
}
