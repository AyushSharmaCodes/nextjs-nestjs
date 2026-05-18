import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}
  @Get() async get() { return ApiResponse.success({ message: 'Notifications endpoint' }); }
}