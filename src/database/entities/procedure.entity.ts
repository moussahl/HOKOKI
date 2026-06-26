import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProcedureProgress } from './procedure-progress.entity';
import { ProcedureStep } from './procedure-step.entity';

@Entity({ name: 'procedures' })
export class Procedure {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  key!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @OneToMany(() => ProcedureStep, (step) => step.procedure)
  steps!: ProcedureStep[];

  @OneToMany(() => ProcedureProgress, (progress) => progress.procedure)
  progressEntries!: ProcedureProgress[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
