import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { JobService } from './job.service';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

const ApiResponse = {
  success: <T>(data: T, message?: string): ApiResponse<T> => ({ success: true, data, message }),
  error: (message: string): ApiResponse => ({ success: false, message }),
};

@Controller('jobs')
export class JobController {
  constructor(private readonly service: JobService) {}

  @Get()
  async getJobs(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
  ) {
    return ApiResponse.success(await this.service.getJobs({ 
      status: status as any, 
      type: type as any,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    }));
  }

  @Get('stats')
  async getStats() {
    return ApiResponse.success(await this.service.getStats());
  }

  @Get('pending')
  async getPending(@Query('limit') limit = 50) {
    return ApiResponse.success(await this.service.getPendingJobs(Number(limit)));
  }

  @Get('recurring')
  async getRecurring() {
    return ApiResponse.success(await this.service.getRecurringJobs());
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return ApiResponse.success(await this.service.getJobById(id));
  }

  @Get('jobId/:jobId')
  async getByJobId(@Param('jobId') jobId: string) {
    return ApiResponse.success(await this.service.getJobByJobId(jobId));
  }

  @Get(':id/runs')
  async getRuns(@Param('id') id: string, @Query('limit') limit = 20) {
    const job = await this.service.getJobById(id);
    return ApiResponse.success(await this.service.getJobRuns(job?.jobId || '', Number(limit)));
  }

  @Post()
  async create(@Body() body: {
    type: string;
    name: string;
    description?: string;
    payload?: any;
    scheduledAt?: string;
    priority?: string;
    timeoutSeconds?: number;
    cronExpression?: string;
    isRecurring?: boolean;
    createdBy?: string;
  }) {
    return ApiResponse.success(
      await this.service.createJob({
        ...body,
        type: body.type as any,
        priority: body.priority as any,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      }),
      'Job created'
    );
  }

  @Put(':id/start')
  async start(@Param('id') id: string) {
    return ApiResponse.success(await this.service.startJob(id), 'Job started');
  }

  @Put(':id/complete')
  async complete(@Param('id') id: string, @Body() body: { result: any }) {
    return ApiResponse.success(await this.service.completeJob(id, body.result), 'Job completed');
  }

  @Put(':id/fail')
  async fail(@Param('id') id: string, @Body() body: { error: string }) {
    return ApiResponse.success(await this.service.failJob(id, body.error), 'Job failed');
  }

  @Put(':id/cancel')
  async cancel(@Param('id') id: string) {
    return ApiResponse.success(await this.service.cancelJob(id), 'Job cancelled');
  }

  @Put(':id/retry')
  async retry(@Param('id') id: string) {
    return ApiResponse.success(await this.service.retryJob(id), 'Job requeued');
  }

  @Put(':id/pause')
  async pause(@Param('id') id: string) {
    return ApiResponse.success(await this.service.pauseJob(id), 'Job paused');
  }

  @Put(':id/resume')
  async resume(@Param('id') id: string) {
    return ApiResponse.success(await this.service.resumeJob(id), 'Job resumed');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.deleteJob(id);
    return ApiResponse.success(null, 'Job deleted');
  }
}