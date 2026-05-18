import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronJob, JobRun } from './entities/job.entity';
import { JobService } from './job.service';
import { JobController } from './job.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CronJob, JobRun])],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}