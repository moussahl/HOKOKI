import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { LawsService } from './laws.service';

import { ListLawsQueryDto } from './dto/list-laws-query.dto';
import { SearchArticlesQueryDto } from './dto/search-articles-query.dto';

import { LawResponseDto, toLawResponseDto } from './dto/law-response.dto';
import { LawArticleResponseDto, toLawArticleResponseDto } from './dto/law-article-response.dto';
import { UserRole } from '../database/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('laws')
export class LawsController {
  constructor(private readonly lawsService: LawsService) {}

  @Get()
  async list(@Query() query: ListLawsQueryDto): Promise<{
    data: LawResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const result = await this.lawsService.list(query);
    return {
      data: result.data.map((law) => toLawResponseDto(law)),
      meta: result.meta,
    };
  }

  @Get('articles/search')
  async searchArticles(@Query() query: SearchArticlesQueryDto): Promise<{
    data: LawArticleResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const p = Math.max(1, Number(query.page) || 1);
    const l = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const result = await this.lawsService.searchArticles(query.q, p, l);
    return {
      data: result.data.map(toLawArticleResponseDto),
      meta: result.meta,
    };
  }

  @Get('articles/:id')
  async getArticleById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LawArticleResponseDto> {
    const article = await this.lawsService.getArticleById(id);
    return toLawArticleResponseDto(article);
  }

  @Get(':id')
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LawResponseDto> {
    const law = await this.lawsService.getById(id);
    return toLawResponseDto(law);
  }

  @Get(':id/articles')
  async getArticles(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LawArticleResponseDto[]> {
    const articles = await this.lawsService.getArticlesByLawId(id);
    return articles.map((article) => toLawArticleResponseDto(article));
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: Record<string, unknown>): Promise<LawResponseDto> {
    const law = await this.lawsService.createLaw(dto as any);
    return toLawResponseDto(law);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Record<string, unknown>,
  ): Promise<LawResponseDto> {
    const law = await this.lawsService.updateLaw(id, dto as any);
    return toLawResponseDto(law);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.lawsService.deleteLaw(id);
  }
}
