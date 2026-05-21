import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutCard, ImpactStat, TimelineEvent, TeamMember, FutureGoal, AboutSettings } from './entities/about.entity';
import { AboutService } from './about.service';
import { AboutController } from './about.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([AboutCard, ImpactStat, TimelineEvent, TeamMember, FutureGoal, AboutSettings]),
  ],
  controllers: [AboutController],
  providers: [AboutService],
  exports: [AboutService],
})
export class AboutModule {}