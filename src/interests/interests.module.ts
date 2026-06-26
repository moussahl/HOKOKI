import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInterest } from '../database/entities/user-interest.entity';
import { InterestsController } from './interests.controller';
import { InterestsService } from './interests.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserInterest])],
  controllers: [InterestsController],
  providers: [InterestsService],
  exports: [InterestsService],
})
export class InterestsModule {}
