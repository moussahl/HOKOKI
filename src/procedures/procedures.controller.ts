import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '../database/entities/user.entity';
import { User } from '../database/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ProceduresService } from './procedures.service';
import { CreateProcedureDto } from './dto/create-procedure.dto';
import { CreateStepDto } from './dto/create-step.dto';
import { ProcedureResponseDto, toProcedureResponseDto } from './dto/procedure-response.dto';
import { ProgressResponseDto, toProgressResponseDto } from './dto/progress-response.dto';
import { StepResponseDto, toStepResponseDto } from './dto/step-response.dto';
import { UpdateProcedureDto } from './dto/update-procedure.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { UpdateStepDto } from './dto/update-step.dto';

@Controller('procedures')
export class ProceduresController {
  constructor(private readonly proceduresService: ProceduresService) {}

  @Get()
  async list(): Promise<ProcedureResponseDto[]> {
    const procedures = await this.proceduresService.list();
    return procedures.map(toProcedureResponseDto);
  }

  @Get(':key')
  async getByKey(@Param('key') key: string): Promise<ProcedureResponseDto> {
    const procedure = await this.proceduresService.findByKey(key);
    return toProcedureResponseDto(procedure);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateProcedureDto): Promise<ProcedureResponseDto> {
    const procedure = await this.proceduresService.create(dto);
    return toProcedureResponseDto(procedure);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProcedureDto,
  ): Promise<ProcedureResponseDto> {
    const procedure = await this.proceduresService.update(id, dto);
    return toProcedureResponseDto(procedure);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string): Promise<void> {
    return this.proceduresService.delete(id);
  }

  @Post(':id/steps')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async addStep(
    @Param('id') id: string,
    @Body() dto: CreateStepDto,
  ): Promise<StepResponseDto> {
    const step = await this.proceduresService.addStep(id, dto);
    return toStepResponseDto(step);
  }

  @Patch('steps/:stepId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateStep(
    @Param('stepId') stepId: string,
    @Body() dto: UpdateStepDto,
  ): Promise<StepResponseDto> {
    const step = await this.proceduresService.updateStep(stepId, dto);
    return toStepResponseDto(step);
  }

  @Delete('steps/:stepId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteStep(@Param('stepId') stepId: string): Promise<void> {
    return this.proceduresService.deleteStep(stepId);
  }

  @Post(':id/start')
  @UseGuards(JwtAuthGuard)
  async start(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<ProgressResponseDto> {
    const progress = await this.proceduresService.startProcedure(user, id);
    return toProgressResponseDto(progress);
  }

  @Get('progress/all')
  @UseGuards(JwtAuthGuard)
  async myProgress(@CurrentUser() user: User): Promise<ProgressResponseDto[]> {
    const progress = await this.proceduresService.getUserProgress(user.id);
    return progress.map(toProgressResponseDto);
  }

  @Patch('progress/:progressId')
  @UseGuards(JwtAuthGuard)
  async updateProgress(
    @CurrentUser() user: User,
    @Param('progressId') progressId: string,
    @Body() dto: UpdateProgressDto,
  ): Promise<ProgressResponseDto> {
    const progress = await this.proceduresService.updateProgress(progressId, user.id, dto);
    return toProgressResponseDto(progress);
  }
}
