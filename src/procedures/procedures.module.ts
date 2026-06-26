import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Procedure } from '../database/entities/procedure.entity';
import { ProcedureProgress } from '../database/entities/procedure-progress.entity';
import { ProcedureStep } from '../database/entities/procedure-step.entity';
import { ProceduresController } from './procedures.controller';
import { ProceduresService } from './procedures.service';

@Module({
  imports: [TypeOrmModule.forFeature([Procedure, ProcedureStep, ProcedureProgress])],
  controllers: [ProceduresController],
  providers: [ProceduresService],
  exports: [ProceduresService],
})
export class ProceduresModule {}
