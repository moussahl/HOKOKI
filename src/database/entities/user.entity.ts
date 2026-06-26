import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Conversation } from './conversation.entity';
import { ExpertSession } from './expert-session.entity';
import { Notification } from './notification.entity';
import { ProcedureProgress } from './procedure-progress.entity';
import { UserInterest } from './user-interest.entity';

export enum UserRole {
  CITIZEN = 'citizen',
  EXPERT = 'expert',
  ADMIN = 'admin',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CITIZEN,
  })
  role!: UserRole;

  @Column({ name: 'preferred_language', default: 'ar' })
  preferredLanguage!: string;

  @Column({ name: 'is_verified_expert', default: false })
  isVerifiedExpert!: boolean;

  @OneToMany(() => Conversation, (conversation) => conversation.user)
  conversations!: Conversation[];

  @OneToMany(() => UserInterest, (interest) => interest.user)
  interests!: UserInterest[];

  @OneToMany(() => ProcedureProgress, (progress) => progress.user)
  procedureProgress!: ProcedureProgress[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => ExpertSession, (session) => session.citizen)
  requestedExpertSessions!: ExpertSession[];

  @OneToMany(() => ExpertSession, (session) => session.expert)
  expertSessions!: ExpertSession[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
