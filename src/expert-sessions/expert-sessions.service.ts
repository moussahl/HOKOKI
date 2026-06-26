import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpertSession, ExpertSessionStatus } from '../database/entities/expert-session.entity';
import { User, UserRole } from '../database/entities/user.entity';
import { CreateExpertSessionDto } from './dto/create-expert-session.dto';
import { UpdateExpertSessionDto } from './dto/update-expert-session.dto';

@Injectable()
export class ExpertSessionsService {
  constructor(
    @InjectRepository(ExpertSession)
    private readonly sessionRepository: Repository<ExpertSession>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(citizen: User, dto: CreateExpertSessionDto): Promise<ExpertSession> {
    const session = this.sessionRepository.create({
      citizen,
      topic: dto.topic ?? null,
      notes: dto.notes ?? null,
      status: ExpertSessionStatus.REQUESTED,
    });
    return this.sessionRepository.save(session);
  }

  async findByUser(user: User): Promise<ExpertSession[]> {
    if (user.role === UserRole.EXPERT || user.role === UserRole.ADMIN) {
      return this.sessionRepository.find({
        where: [{ citizen: { id: user.id } }, { expert: { id: user.id } }],
        relations: ['citizen', 'expert'],
        order: { createdAt: 'DESC' },
      });
    }
    return this.sessionRepository.find({
      where: { citizen: { id: user.id } },
      relations: ['citizen', 'expert'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<ExpertSession> {
    const session = await this.sessionRepository.findOne({
      where: { id },
      relations: ['citizen', 'expert'],
    });
    if (!session) throw new NotFoundException(`Session with id ${id} was not found`);
    return session;
  }

  async update(
    id: string,
    user: User,
    dto: UpdateExpertSessionDto,
  ): Promise<ExpertSession> {
    const session = await this.findById(id);
    const isCitizen = session.citizen.id === user.id;
    const isExpert = session.expert?.id === user.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isCitizen && !isExpert && !isAdmin) {
      throw new ForbiddenException('You do not have access to this session');
    }

    if (dto.status === ExpertSessionStatus.CANCELLED && !isCitizen && !isAdmin) {
      throw new ForbiddenException('Only the citizen or admin can cancel');
    }

    if (dto.status === ExpertSessionStatus.CONFIRMED && !isExpert && !isAdmin) {
      throw new ForbiddenException('Only the expert or admin can confirm');
    }

    if (dto.notes !== undefined) session.notes = dto.notes;
    if (dto.status !== undefined) session.status = dto.status;
    return this.sessionRepository.save(session);
  }

  async assignExpert(sessionId: string, expert: User): Promise<ExpertSession> {
    const session = await this.findById(sessionId);
    session.expert = expert;
    session.status = ExpertSessionStatus.CONFIRMED;
    return this.sessionRepository.save(session);
  }

  async getAvailableExperts(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.EXPERT, isVerifiedExpert: true },
    });
  }
}
