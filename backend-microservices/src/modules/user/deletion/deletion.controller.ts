import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { DeletionService } from './deletion.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('account')
export class DeletionController {
  constructor(private readonly service: DeletionService) {}

  @Get('eligibility') async checkEligibility(@Headers('x-user-id') identityId: string) { return ApiResponse.success(await this.service.checkEligibility(identityId)); }
  @Get('deletion-status') async getStatus(@Headers('x-user-id') identityId: string) { return ApiResponse.success(await this.service.getStatus(identityId)); }
  @Post('request-deletion-otp') async requestDeletion(@Headers('x-user-id') identityId: string, @Headers('x-profile-id') profileId: string) { return ApiResponse.success(await this.service.requestDeletion(identityId, profileId), 'Deletion requested'); }
  @Post('verify-deletion-otp') async verifyOtp(@Body() body: { jobId: string }) { return ApiResponse.success(await this.service.verifyOtp(body.jobId), 'OTP verified'); }
  @Post('schedule-deletion') async schedule(@Body() body: { jobId: string; days?: number }) { return ApiResponse.success(await this.service.scheduleDeletion(body.jobId, body.days), 'Deletion scheduled'); }
  @Post('confirm-deletion') async confirm(@Body() body: { jobId: string }) { return ApiResponse.success(await this.service.confirmDeletion(body.jobId), 'Deletion confirmed'); }
  @Post('cancel-deletion') async cancel(@Body() body: { jobId: string }) { return ApiResponse.success(await this.service.cancelDeletion(body.jobId), 'Deletion cancelled'); }
}

@Controller('account/admin')
export class DeletionAdminController {
  constructor(private readonly service: DeletionService) {}

  @Post('process-pending') async processPending() { const jobs = await this.service.processPending(); for (const job of jobs) { await this.service.processDeletion(job.id); } return ApiResponse.success({ processed: jobs.length }); }
}