import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Procedure } from './procedure.entity';
import { User } from './user.entity';

export enum ProcedureProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

@Entity({ name: 'procedure_progress' })
@Unique('UQ_user_procedure_progress', ['user', 'procedure'])
export class ProcedureProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.procedureProgress, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Procedure, (procedure) => procedure.progressEntries, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'procedure_id' })
  procedure!: Procedure;

  @Column({ name: 'current_step_order', type: 'int', default: 1 })
  currentStepOrder!: number;

  @Column({
    type: 'enum',
    enum: ProcedureProgressStatus,
    default: ProcedureProgressStatus.NOT_STARTED,
  })
  status!: ProcedureProgressStatus;

  @Column({ name: 'advice_note', type: 'text', nullable: true })
  adviceNote!: string | null;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
