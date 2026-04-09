import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../auth/user.entity';
import { AccountStatus } from '../auth/account-status.enum';
import { UserRole } from '../auth/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Get all users
  async findAll() {
  const users = await this.userRepository.find({
    order: { createdAt: 'DESC' },
  });

  return users.map(({ password, ...user }) => user);
}
  // Get pending users (contractors waiting approval)
  async findPending() {
    return this.userRepository.find({
      where: { status: AccountStatus.PENDING },
    });
  }

  // Approve user
  async approveUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = AccountStatus.ACTIVE;

    return this.userRepository.save(user);
  }

  // Suspend user
  async suspendUser(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = AccountStatus.SUSPENDED;

    return this.userRepository.save(user);
  }

  // Delete user
  async deleteUser(id: number) {
  const user = await this.userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // ✅ Soft delete instead of hard delete
  user.status = AccountStatus.SUSPENDED;

  await this.userRepository.save(user);

  return { message: 'User deactivated successfully' };
}
  async rejectUser(id: number) {

  const user = await this.userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  user.status = AccountStatus.REJECTED;

  return this.userRepository.save(user);
}
async resetPassword(id: number, newPassword: string) {

  const user = await this.userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  user.password = hashed;

  return this.userRepository.save(user);
}
async findApprovedContractors() {

  const users = await this.userRepository.find({
    where: {
      role: UserRole.CONTRACTOR,
      status: AccountStatus.ACTIVE,
    },
    order: { name: 'ASC' }
  });

  return users.map(({ password, ...user }) => user);
}
async findByEmail(email: string) {
  const user = await this.userRepository.findOne({
    where: { email },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  // ✅ Return only safe fields
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
async activateUser(id: number) {
  const user = await this.userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  user.status = AccountStatus.ACTIVE;

  return this.userRepository.save(user);
}
}