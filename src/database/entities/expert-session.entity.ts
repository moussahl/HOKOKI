import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ExpertSessionStatus {
  REQUESTED = 'requested',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

@Entity({ name: 'expert_sessions' })
export class ExpertSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.requestedExpertSessions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'citizen_id' })
  citizen!: User;

  @ManyToOne(() => User, (user) => user.expertSessions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'expert_id' })
  expert!: User | null;

  @Column({ type: 'varchar', nullable: true })
  topic!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt!: Date | null;

  @Column({
    type: 'enum',
    enum: ExpertSessionStatus,
    default: ExpertSessionStatus.REQUESTED,
  })
  status!: ExpertSessionStatus;

  @Column({ name: 'citizen_rating', type: 'smallint', nullable: true, default: null })
  citizenRating!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
