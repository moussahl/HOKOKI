import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Procedure } from './procedure.entity';

@Entity({ name: 'procedure_steps' })
@Unique('UQ_procedure_step_order', ['procedure', 'stepOrder'])
export class ProcedureStep {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Procedure, (procedure) => procedure.steps, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'procedure_id' })
  procedure!: Procedure;

  @Column({ name: 'step_order', type: 'int' })
  stepOrder!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    name: 'required_documents',
    type: 'text',
    array: true,
    default: '{}',
  })
  requiredDocuments!: string[];

  @Column({ name: 'location_hint', type: 'varchar', nullable: true })
  locationHint!: string | null;
}
