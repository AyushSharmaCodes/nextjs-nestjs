import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Manager, ManagerPermissions } from './entities/manager.entity';
import { ManagerFilters } from './manager.service';

@Injectable()
export class ManagerRepository {
  constructor(
    @InjectRepository(Manager) private managerRepo: Repository<Manager>,
    @InjectRepository(ManagerPermissions) private permsRepo: Repository<ManagerPermissions>,
  ) {}

  async findAll() { 
    return this.managerRepo.find({ where: { isActive: true }, relations: ['permissions'] }); 
  }

  async findWithFilters(filters?: ManagerFilters) {
    const qb = this.managerRepo.createQueryBuilder('m');
    
    if (filters?.role) qb.andWhere('m.role = :role', { role: filters.role });
    if (filters?.isActive !== undefined) qb.andWhere('m.isActive = :isActive', { isActive: filters.isActive });
    if (filters?.search) {
      qb.andWhere('(m.name ILIKE :search OR m.phone ILIKE :search OR m.identityId ILIKE :search)', 
        { search: `%${filters.search}%` });
    }
    
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    
    qb.skip((page - 1) * limit).take(limit)
      .orderBy('m.createdAt', 'DESC');
    
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async findById(id: string) { 
    return this.managerRepo.findOne({ where: { id } }); 
  }

  async findByIdentityId(identityId: string) { 
    return this.managerRepo.findOne({ where: { identityId } }); 
  }

  async create(data: Partial<Manager>) { 
    return this.managerRepo.save(this.managerRepo.create(data)); 
  }

  async update(id: string, data: Partial<Manager>) { 
    await this.managerRepo.update(id, data); 
    return this.findById(id); 
  }

  async delete(id: string) { 
    await this.managerRepo.update(id, { isActive: false }); 
  }
  
  async getPermissions(managerId: string) {
    let perms = await this.permsRepo.findOne({ where: { managerId } });
    if (!perms) {
      perms = this.permsRepo.create({ managerId });
      await this.permsRepo.save(perms);
    }
    return perms;
  }

  async updatePermissions(managerId: string, data: Partial<ManagerPermissions>) {
    let perms = await this.permsRepo.findOne({ where: { managerId } });
    if (perms) {
      await this.permsRepo.update(perms.id, data);
      return this.permsRepo.findOne({ where: { managerId } });
    }
    perms = this.permsRepo.create({ managerId, ...data });
    return this.permsRepo.save(perms);
  }
}