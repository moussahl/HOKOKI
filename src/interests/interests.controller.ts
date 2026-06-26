import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '../database/entities/user.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterestsService } from './interests.service';
import { CreateInterestDto } from './dto/create-interest.dto';
import { InterestResponseDto, toInterestResponseDto } from './dto/interest-response.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';

@Controller('interests')
@UseGuards(JwtAuthGuard)
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Get()
  async list(@CurrentUser() user: User): Promise<InterestResponseDto[]> {
    const interests = await this.interestsService.findByUser(user.id);
    return interests.map(toInterestResponseDto);
  }

  @Post()
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateInterestDto,
  ): Promise<InterestResponseDto> {
    const interest = await this.interestsService.create(user, dto);
    return toInterestResponseDto(interest);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateInterestDto,
  ): Promise<InterestResponseDto> {
    const interest = await this.interestsService.update(id, user.id, dto);
    return toInterestResponseDto(interest);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: User, @Param('id') id: string): Promise<void> {
    return this.interestsService.delete(id, user.id);
  }
}
