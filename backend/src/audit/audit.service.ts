import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
  ) {}

  async logAction(
    entity: string,
    entityId: number,
    action: string,
    performedBy?: number,
    oldData?: any,
    newData?: any,
  ) {
    const log = this.auditRepository.create({
      entity,
      entityId,
      action,
      performedBy,
      oldData,
      newData,
    });

    await this.auditRepository.save(log);
  }
  async findAll() {
  return this.auditRepository.find({
    order: { createdAt: 'DESC' },
  });
}

}
