import { Injectable, Inject } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { AdminEntity } from '../entities/AdminEntity';

export const adminRepositoryProvider = {
  provide: 'ADMIN_REPOSITORY',
  useFactory: (dataSource: DataSource): Repository<AdminEntity> =>
    dataSource.getRepository(AdminEntity),
  inject: ['DATA_SOURCE'],
};

@Injectable()
export class AdminRepository {
  constructor(
    @Inject('ADMIN_REPOSITORY')
    private adminRepository: Repository<AdminEntity>,
  ) {}

  async findById(adminId: number): Promise<AdminEntity | null> {
    return await this.adminRepository
      .createQueryBuilder('admin')
      .where('admin.id = :adminId', { adminId })
      .getOne();
  }

  async findByEmail(email: string): Promise<AdminEntity | null> {
    return await this.adminRepository
      .createQueryBuilder('admin')
      .where('admin.email = :email', { email })
      .getOne();
  }

  async save(adminEntity: AdminEntity): Promise<AdminEntity> {
    return await this.adminRepository.save(adminEntity);
  }

  async findAll(): Promise<AdminEntity[]> {
    return await this.adminRepository.find();
  }
}
