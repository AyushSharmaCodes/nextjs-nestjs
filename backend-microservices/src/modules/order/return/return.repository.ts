import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Return } from './entities/return.entity';
import { ReturnItem, ReturnQCResult } from './entities/return-item.entity';

@Injectable()
export class ReturnRepository {
  constructor(
    @InjectRepository(Return)
    private readonly returnRepo: Repository<Return>,
    @InjectRepository(ReturnItem)
    private readonly itemRepo: Repository<ReturnItem>,
    @InjectRepository(ReturnQCResult)
    private readonly qcRepo: Repository<ReturnQCResult>,
  ) {}

  async create(orderId: string, userId: string, items: { orderItemId: string; quantity: number; reason: string }[], reason: string): Promise<Return> {
    const ret = this.returnRepo.create({
      orderId,
      userId,
      reason,
      status: 'REQUESTED',
    });
    const saved = await this.returnRepo.save(ret);

    const returnItems = items.map(item =>
      this.itemRepo.create({
        returnId: saved.id,
        orderItemId: item.orderItemId,
        quantity: item.quantity,
        reason: item.reason,
        status: 'PENDING',
      }),
    );
    await this.itemRepo.save(returnItems);

    return this.findById(saved.id) as Promise<Return>;
  }

  async findById(id: string) {
    return this.returnRepo.findOne({
      where: { id },
      relations: ['items', 'order'],
    });
  }

  async findByUserId(userId: string) {
    return this.returnRepo.find({
      where: { userId },
      relations: ['items', 'order'],
      order: { createdAt: 'DESC' },
    });
  }

  async findPending() {
    return this.returnRepo.find({
      where: { status: 'REQUESTED' },
      relations: ['items', 'order'],
      order: { createdAt: 'ASC' },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.returnRepo.update(id, { status });
    return this.findById(id);
  }

  async approve(id: string, refundAmount: number) {
    await this.returnRepo.update(id, { status: 'APPROVED', refundAmount });
    return this.findById(id);
  }

  async reject(id: string) {
    await this.returnRepo.update(id, { status: 'REJECTED' });
    return this.findById(id);
  }

  async complete(id: string) {
    await this.returnRepo.update(id, { status: 'COMPLETED' });
    return this.findById(id);
  }

  async addQCResult(returnItemId: string, data: { inspectedBy?: string; condition: string; isApproved: boolean; notes?: string; photos?: string[] }) {
    const qc = this.qcRepo.create({
      returnItemId,
      ...data,
    });
    await this.qcRepo.save(qc);

    await this.itemRepo.update(returnItemId, { status: data.isApproved ? 'APPROVED' : 'REJECTED' });
    return qc;
  }
}