import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInterest } from '../database/entities/user-interest.entity';
import { User } from '../database/entities/user.entity';
import { CreateInterestDto } from './dto/create-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';

@Injectable()
export class InterestsService {
  constructor(
    @InjectRepository(UserInterest)
    private readonly interestRepository: Repository<UserInterest>,
  ) {}

  async findByUser(userId: string): Promise<UserInterest[]> {
    return this.interestRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async create(user: User, dto: CreateInterestDto): Promise<UserInterest> {
    const existing = await this.interestRepository.findOne({
      where: { user: { id: user.id }, topic: dto.topic },
    });
    if (existing) throw new ConflictException(`Interest '${dto.topic}' already exists`);
    const interest = this.interestRepository.create({
      user,
      topic: dto.topic,
    });
    return this.interestRepository.save(interest);
  }

  async update(id: string, userId: string, dto: UpdateInterestDto): Promise<UserInterest> {
    const interest = await this.interestRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!interest) throw new NotFoundException('Interest not found');
    if (dto.isSubscribed !== undefined) interest.isSubscribed = dto.isSubscribed;
    return this.interestRepository.save(interest);
  }

  async delete(id: string, userId: string): Promise<void> {
    const result = await this.interestRepository.delete({ id, user: { id: userId } });
    if (result.affected === 0) throw new NotFoundException('Interest not found');
  }
}
