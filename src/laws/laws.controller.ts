import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LawsService } from './laws.service';
import { ListLawsQueryDto } from './dto/list-laws-query.dto';
import { SearchArticlesQueryDto } from './dto/search-articles-query.dto';
import { LawResponseDto, toLawResponseDto } from './dto/law-response.dto';
import { LawArticleResponseDto, toLawArticleResponseDto } from './dto/law-article-response.dto';
import { UserRole } from '../database/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('laws')
@Controller('laws')
export class LawsController {
  constructor(private readonly lawsService: LawsService) {}

  @Get()
  @ApiOperation({ summary: 'List laws with optional filters and pagination' })
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
  @ApiOperation({ summary: 'Full-text search across law articles' })
  async searchArticles(@Query() query: SearchArticlesQueryDto): Promise<{
    data: LawArticleResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const result = await this.lawsService.searchArticles(query.q, query.page ?? 1, query.limit ?? 20);
    return {
      data: result.data.map(toLawArticleResponseDto),
      meta: result.meta,
    };
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get a single law article by ID' })
  async getArticleById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LawArticleResponseDto> {
    const article = await this.lawsService.getArticleById(id);
    return toLawArticleResponseDto(article);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single law by ID' })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LawResponseDto> {
    const law = await this.lawsService.getById(id);
    return toLawResponseDto(law);
  }

  @Get(':id/articles')
  @ApiOperation({ summary: 'Get all articles for a specific law' })
  async getArticles(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LawArticleResponseDto[]> {
    const articles = await this.lawsService.getArticlesByLawId(id);
    return articles.map((article) => toLawArticleResponseDto(article));
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a law (admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: Record<string, unknown>): Promise<LawResponseDto> {
    const law = await this.lawsService.createLaw(dto as any);
    return toLawResponseDto(law);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a law (admin only)' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a law (admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.lawsService.deleteLaw(id);
  }
}
