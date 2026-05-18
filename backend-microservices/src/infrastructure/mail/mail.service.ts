import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private sesClient: SESClient | null = null;

  constructor(private configService: ConfigService) {
    this.initializeProvider();
  }

  private initializeProvider() {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');

    if (nodeEnv === 'production') {
      // Initialize Amazon SES
      this.logger.log('Initializing Amazon SES for email delivery');
      this.sesClient = new SESClient({
        region: this.configService.get<string>('AWS_REGION'),
        credentials: {
          accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
          secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
        },
      });
    } else {
      // Initialize SMTP
      const smtpHost = this.configService.get<string>('SMTP_HOST');
      if (smtpHost) {
        this.logger.log(`Initializing SMTP transport for email delivery via ${smtpHost}`);
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: this.configService.get<number>('SMTP_PORT', 587),
          secure: this.configService.get<boolean>('SMTP_SECURE', false),
          auth: {
            user: this.configService.get<string>('SMTP_USER'),
            pass: this.configService.get<string>('SMTP_PASS'),
          },
        });
      } else {
        this.logger.warn('No SMTP configuration found. Defaulting to Console transport for email delivery');
      }
    }
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const from = this.configService.get<string>('MAIL_FROM', 'noreply@merigaumata.com');

    if (nodeEnv === 'production' && this.sesClient) {
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
      } catch (error) {
        this.logger.error(`Failed to send email to ${options.to} via SES`, error);
      }
    } else if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          ...options,
        });
        this.logger.log(`Sent email to ${options.to} via SMTP`);
      } catch (error) {
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
