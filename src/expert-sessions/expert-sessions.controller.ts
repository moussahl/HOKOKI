import { Body, Controller, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../database/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ExpertSessionsService } from './expert-sessions.service';
import { CreateExpertSessionDto } from './dto/create-expert-session.dto';
import { ExpertSessionResponseDto, toExpertSessionResponseDto } from './dto/expert-session-response.dto';
import { UpdateExpertSessionDto } from './dto/update-expert-session.dto';

@Controller('expert-sessions')
export class ExpertSessionsController {
  constructor(
    private readonly expertSessionsService: ExpertSessionsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateExpertSessionDto,
  ): Promise<ExpertSessionResponseDto> {
    const session = await this.expertSessionsService.create(user, dto);
    return toExpertSessionResponseDto(session);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@CurrentUser() user: User): Promise<ExpertSessionResponseDto[]> {
    const sessions = await this.expertSessionsService.findByUser(user);
    return sessions.map(toExpertSessionResponseDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string): Promise<ExpertSessionResponseDto> {
    const session = await this.expertSessionsService.findById(id);
    return toExpertSessionResponseDto(session);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateExpertSessionDto,
  ): Promise<ExpertSessionResponseDto> {
    const session = await this.expertSessionsService.update(id, user, dto);
    return toExpertSessionResponseDto(session);
  }

  @Post(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async assign(
    @Param('id') id: string,
    @Body('expertId') expertId: string,
  ): Promise<ExpertSessionResponseDto> {
    const expert = await this.userRepository.findOne({
      where: { id: expertId, role: UserRole.EXPERT },
    });
    if (!expert) throw new NotFoundException('Expert not found');
    const session = await this.expertSessionsService.assignExpert(id, expert);
    return toExpertSessionResponseDto(session);
  }

  @Get('experts/available')
  @UseGuards(JwtAuthGuard)
  async availableExperts(): Promise<{ id: string; fullName: string }[]> {
    const experts = await this.expertSessionsService.getAvailableExperts();
    return experts.map((e) => ({ id: e.id, fullName: e.fullName }));
  }
}
