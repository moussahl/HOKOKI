import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { User } from '../database/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpertSessionsService } from './expert-sessions.service';
import { CreateExpertSessionDto } from './dto/create-expert-session.dto';
import { RateSessionDto } from './dto/rate-session.dto';
import { ExpertSessionResponseDto, toExpertSessionResponseDto } from './dto/expert-session-response.dto';
import { UpdateExpertSessionDto } from './dto/update-expert-session.dto';

@ApiTags('expert-sessions')
@ApiBearerAuth()
@Controller('expert-sessions')
@UseGuards(JwtAuthGuard)
export class ExpertSessionsController {
  constructor(private readonly expertSessionsService: ExpertSessionsService) {}

  @Get('experts')
  @ApiOperation({ summary: 'Browse verified experts (optionally filter by specialty)' })
  @ApiQuery({ name: 'specialty', required: false, description: 'Filter by specialty keyword' })
  async listExperts(
    @Query('specialty') specialty?: string,
  ): Promise<{ id: string; fullName: string; specialty: string | null; averageRating: number; ratingCount: number }[]> {
    const experts = await this.expertSessionsService.listExperts(specialty);
    return experts.map((e) => ({
      id: e.id,
      fullName: e.fullName,
      specialty: e.specialty,
      averageRating: e.averageRating,
      ratingCount: e.ratingCount,
    }));
  }

  @Post()
  @ApiOperation({ summary: 'Contact an expert — citizen picks the expert directly' })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateExpertSessionDto,
  ): Promise<ExpertSessionResponseDto> {
    const session = await this.expertSessionsService.create(user, dto);
    return toExpertSessionResponseDto(session);
  }

  @Get()
  @ApiOperation({ summary: 'List your expert sessions (as citizen or expert)' })
  async list(@CurrentUser() user: User): Promise<ExpertSessionResponseDto[]> {
    const sessions = await this.expertSessionsService.findByUser(user);
    return sessions.map(toExpertSessionResponseDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expert session by ID' })
  async getById(@Param('id') id: string): Promise<ExpertSessionResponseDto> {
    const session = await this.expertSessionsService.findById(id);
    return toExpertSessionResponseDto(session);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update session status — expert confirms/rejects/completes, citizen cancels' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateExpertSessionDto,
  ): Promise<ExpertSessionResponseDto> {
    const session = await this.expertSessionsService.update(id, user, dto);
    return toExpertSessionResponseDto(session);
  }

  @Post(':id/rate')
  @ApiOperation({ summary: 'Rate the expert after a session is completed (citizen only, once)' })
  async rate(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: RateSessionDto,
  ): Promise<ExpertSessionResponseDto> {
    const session = await this.expertSessionsService.rateSession(id, user, dto.rating);
    return toExpertSessionResponseDto(session);
  }
}
