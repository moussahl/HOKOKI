import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertSession } from '../database/entities/expert-session.entity';
import { User } from '../database/entities/user.entity';
import { ExpertSessionsController } from './expert-sessions.controller';
import { ExpertSessionsService } from './expert-sessions.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExpertSession, User])],
  controllers: [ExpertSessionsController],
  providers: [ExpertSessionsService],
  exports: [ExpertSessionsService],
})
export class ExpertSessionsModule {}
