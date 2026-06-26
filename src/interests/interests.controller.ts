import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '../database/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterestsService } from './interests.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { InterestResponseDto, toInterestResponseDto } from './dto/interest-response.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';

@ApiTags('interests')
@ApiBearerAuth()
@Controller('interests')
@UseGuards(JwtAuthGuard)
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Get()
  @ApiOperation({ summary: 'List interests for the current user' })
  async list(@CurrentUser() user: User): Promise<InterestResponseDto[]> {
    const interests = await this.interestsService.findByUser(user.id);
    return interests.map(toInterestResponseDto);
  }

  @Post()
  @ApiOperation({ summary: 'Add an interest' })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateInterestDto,
  ): Promise<InterestResponseDto> {
    const interest = await this.interestsService.create(user, dto);
    return toInterestResponseDto(interest);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an interest' })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateInterestDto,
  ): Promise<InterestResponseDto> {
    const interest = await this.interestsService.update(id, user.id, dto);
    return toInterestResponseDto(interest);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove an interest' })
  async delete(@CurrentUser() user: User, @Param('id') id: string): Promise<void> {
    return this.interestsService.delete(id, user.id);
  }
}
