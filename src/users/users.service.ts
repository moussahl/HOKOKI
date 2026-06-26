import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../database/entities/user.entity';

export interface CreateUserInput {
  email: string;
  fullName: string;
  passwordHash: string;
  preferredLanguage?: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = this.userRepository.create({
      email: input.email.toLowerCase(),
      fullName: input.fullName,
      passwordHash: input.passwordHash,
      preferredLanguage: input.preferredLanguage ?? 'ar',
      role: input.role ?? UserRole.CITIZEN,
    });

    return this.userRepository.save(user);
  }
}
