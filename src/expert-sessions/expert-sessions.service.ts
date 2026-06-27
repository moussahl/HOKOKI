import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async listExperts(specialty?: string): Promise<User[]> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.EXPERT })
      .andWhere('user.isVerifiedExpert = true')
      .orderBy('user.averageRating', 'DESC');

    if (specialty) {
      qb.andWhere('LOWER(user.specialty) LIKE LOWER(:specialty)', {
        specialty: `%${specialty}%`,
      });
    }

    return qb.getMany();
  }

  async create(citizen: User, dto: CreateExpertSessionDto): Promise<ExpertSession> {
    const expert = await this.userRepository.findOne({
      where: { id: dto.expertId, role: UserRole.EXPERT, isVerifiedExpert: true },
    });

    if (!expert) {
      throw new NotFoundException('Expert not found or is not a verified expert');
    }

    const session = this.sessionRepository.create({
      citizen,
      expert,
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
    if (!session) throw new NotFoundException(`Session ${id} not found`);
    return session;
  }

  async update(id: string, user: User, dto: UpdateExpertSessionDto): Promise<ExpertSession> {
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
      throw new ForbiddenException('Only the assigned expert can confirm');
    }

    if (dto.status === ExpertSessionStatus.REJECTED && !isExpert && !isAdmin) {
      throw new ForbiddenException('Only the assigned expert can reject');
    }

    if (dto.status === ExpertSessionStatus.COMPLETED && !isExpert && !isAdmin) {
      throw new ForbiddenException('Only the assigned expert can mark as completed');
    }

    if (dto.notes !== undefined) session.notes = dto.notes;
    if (dto.status !== undefined) session.status = dto.status;

    return this.sessionRepository.save(session);
  }

  async rateSession(id: string, citizen: User, rating: number): Promise<ExpertSession> {
    const session = await this.findById(id);

    if (session.citizen.id !== citizen.id) {
      throw new ForbiddenException('Only the citizen of this session can rate it');
    }

    if (session.status !== ExpertSessionStatus.COMPLETED) {
      throw new BadRequestException('You can only rate a completed session');
    }

    if (session.citizenRating !== null) {
      throw new BadRequestException('You have already rated this session');
    }

    if (!session.expert) {
      throw new BadRequestException('No expert assigned to this session');
    }

    session.citizenRating = rating;
    await this.sessionRepository.save(session);

    const expert = session.expert;
    const newCount = expert.ratingCount + 1;
    expert.averageRating = (expert.averageRating * expert.ratingCount + rating) / newCount;
    expert.ratingCount = newCount;
    await this.userRepository.save(expert);

    return session;
  }
}
