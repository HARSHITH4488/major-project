import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';
import { UserRole } from './role.enum';
import { AccountStatus } from './account-status.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  // ================= REGISTER =================
  async register(
  name: string,
  email: string,
  phone: string,
  password: string,
  role: UserRole,
) {

  const existingUser = await this.userRepository.findOne({
    where: { email },
  });

  if (existingUser) {
    throw new ConflictException('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = this.userRepository.create({
    name,
    email,
    phone,
    password: hashedPassword,
    role,
    status: AccountStatus.PENDING,
  });

  const savedUser = await this.userRepository.save(user);

  return {
    message: 'Registration successful. Awaiting admin approval.',
    userId: savedUser.id,
  };
}

  // ================= LOGIN =================
  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Account not active. Await admin approval.',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}