import { Controller, Get, Post, Body } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { DeletionService } from './deletion.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('account')
export class DeletionController {
  constructor(private readonly service: DeletionService) {}

  @Get('eligibility') async checkEligibility(@CurrentUser() user: { id: string }) { return ApiResponse.success(await this.service.checkEligibility(user.id)); }
  @Get('deletion-status') async getStatus(@CurrentUser() user: { id: string }) { return ApiResponse.success(await this.service.getStatus(user.id)); }
  @Post('request-deletion-otp') async requestDeletion(@CurrentUser() user: { id: string }) { return ApiResponse.success(await this.service.requestDeletion(user.id, user.id), 'Deletion requested'); }
  @Post('verify-deletion-otp') async verifyOtp(@Body() body: { jobId: string }) { return ApiResponse.success(await this.service.verifyOtp(body.jobId), 'OTP verified'); }
  @Post('schedule-deletion') async schedule(@Body() body: { jobId: string; days?: number }) { return ApiResponse.success(await this.service.scheduleDeletion(body.jobId, body.days), 'Deletion scheduled'); }
  @Post('confirm-deletion') async confirm(@Body() body: { jobId: string }) { return ApiResponse.success(await this.service.confirmDeletion(body.jobId), 'Deletion confirmed'); }
  @Post('cancel-deletion') async cancel(@Body() body: { jobId: string }) { return ApiResponse.success(await this.service.cancelDeletion(body.jobId), 'Deletion cancelled'); }
}

@Roles('ADMIN')
@Controller('account/admin')
export class DeletionAdminController {
  constructor(private readonly service: DeletionService) {}

  @Post('process-pending') async processPending() { const jobs = await this.service.processPending(); for (const job of jobs) { await this.service.processDeletion(job.id); } return ApiResponse.success({ processed: jobs.length }); }
}
