import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit.entity';
import { RequestLog } from './entities/request.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    @InjectRepository(RequestLog) private reqRepo: Repository<RequestLog>,
  ) {}

  getAuditLogs(limit = 100) { return this.auditRepo.find({ order: { createdAt: 'DESC' }, take: limit }); }
  getRequestLogs(limit = 100) { return this.reqRepo.find({ order: { createdAt: 'DESC' }, take: limit }); }
}