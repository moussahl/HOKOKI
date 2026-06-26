import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Procedure } from '../database/entities/procedure.entity';
import { ProcedureProgress, ProcedureProgressStatus } from '../database/entities/procedure-progress.entity';
import { ProcedureStep } from '../database/entities/procedure-step.entity';
import { User } from '../database/entities/user.entity';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { UpdateStepDto } from './dto/update-step.dto';

@Injectable()
export class ProceduresService {
  constructor(
    @InjectRepository(Procedure)
    private readonly procedureRepository: Repository<Procedure>,
    @InjectRepository(ProcedureStep)
    private readonly stepRepository: Repository<ProcedureStep>,
    @InjectRepository(ProcedureProgress)
    private readonly progressRepository: Repository<ProcedureProgress>,
  ) {}

  async list(): Promise<Procedure[]> {
    return this.procedureRepository.find({ relations: ['steps'], order: { createdAt: 'DESC' } });
  }

  async findByKey(key: string): Promise<Procedure> {
    const procedure = await this.procedureRepository.findOne({
      where: { key },
      relations: ['steps'],
      order: { steps: { stepOrder: 'ASC' } },
    });
    if (!procedure) throw new NotFoundException(`Procedure '${key}' was not found`);
    return procedure;
  }

  async findById(id: string): Promise<Procedure> {
    const procedure = await this.procedureRepository.findOne({
      where: { id },
      relations: ['steps'],
      order: { steps: { stepOrder: 'ASC' } },
    });
    if (!procedure) throw new NotFoundException(`Procedure with id ${id} was not found`);
    return procedure;
  }

  async create(dto: CreateProcedureDto): Promise<Procedure> {
    const existing = await this.procedureRepository.findOne({ where: { key: dto.key } });
    if (existing) throw new ConflictException(`Procedure with key '${dto.key}' already exists`);
    const procedure = this.procedureRepository.create(dto);
    return this.procedureRepository.save(procedure);
  }

  async update(id: string, dto: UpdateProcedureDto): Promise<Procedure> {
    const procedure = await this.findById(id);
    if (dto.title !== undefined) procedure.title = dto.title;
    if (dto.description !== undefined) procedure.description = dto.description;
    return this.procedureRepository.save(procedure);
  }

  async delete(id: string): Promise<void> {
    const result = await this.procedureRepository.delete(id);
    if (result.affected === 0) throw new NotFoundException(`Procedure with id ${id} was not found`);
  }

  async addStep(procedureId: string, dto: CreateStepDto): Promise<ProcedureStep> {
    const procedure = await this.findById(procedureId);
    const step = this.stepRepository.create({
      procedure,
      stepOrder: dto.stepOrder,
      title: dto.title,
      description: dto.description ?? null,
      requiredDocuments: dto.requiredDocuments ?? [],
      locationHint: dto.locationHint ?? null,
    });
    return this.stepRepository.save(step);
  }

  async updateStep(stepId: string, dto: UpdateStepDto): Promise<ProcedureStep> {
    const step = await this.stepRepository.findOne({ where: { id: stepId }, relations: ['procedure'] });
    if (!step) throw new NotFoundException(`Step with id ${stepId} was not found`);
    if (dto.stepOrder !== undefined) step.stepOrder = dto.stepOrder;
    if (dto.title !== undefined) step.title = dto.title;
    if (dto.description !== undefined) step.description = dto.description;
    if (dto.requiredDocuments !== undefined) step.requiredDocuments = dto.requiredDocuments;
    if (dto.locationHint !== undefined) step.locationHint = dto.locationHint;
    return this.stepRepository.save(step);
  }

  async deleteStep(stepId: string): Promise<void> {
    const result = await this.stepRepository.delete(stepId);
    if (result.affected === 0) throw new NotFoundException(`Step with id ${stepId} was not found`);
  }

  async startProcedure(user: User, procedureId: string): Promise<ProcedureProgress> {
    const procedure = await this.findById(procedureId);
    const existing = await this.progressRepository.findOne({
      where: { user: { id: user.id }, procedure: { id: procedureId } },
    });
    if (existing) throw new ConflictException('You have already started this procedure');
    const progress = this.progressRepository.create({
      user,
      procedure,
      currentStepOrder: 1,
      status: ProcedureProgressStatus.IN_PROGRESS,
      startedAt: new Date(),
    });
    return this.progressRepository.save(progress);
  }

  async getUserProgress(userId: string): Promise<ProcedureProgress[]> {
    return this.progressRepository.find({
      where: { user: { id: userId } },
      relations: ['procedure'],
      order: { updatedAt: 'DESC' },
    });
  }

  async updateProgress(progressId: string, userId: string, dto: UpdateProgressDto): Promise<ProcedureProgress> {
    const progress = await this.progressRepository.findOne({
      where: { id: progressId, user: { id: userId } },
      relations: ['procedure'],
    });
    if (!progress) throw new NotFoundException(`Progress entry was not found`);
    if (dto.currentStepOrder !== undefined) progress.currentStepOrder = dto.currentStepOrder;
    if (dto.status !== undefined) {
      progress.status = dto.status;
      if (dto.status === ProcedureProgressStatus.COMPLETED) progress.completedAt = new Date();
    }
    if (dto.adviceNote !== undefined) progress.adviceNote = dto.adviceNote;
    return this.progressRepository.save(progress);
  }
}
