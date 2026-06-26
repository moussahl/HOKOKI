import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LawArticle } from './law-article.entity';

@Entity({ name: 'laws' })
export class Law {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  slug!: string;

  @Column()
  title!: string;

  @Column({ type: 'varchar', nullable: true })
  category!: string | null;

  @Column({ default: 'ar' })
  language!: string;

  @Column({ name: 'source_url' })
  sourceUrl!: string;

  @Column({ name: 'source_published_at', type: 'timestamptz', nullable: true })
  sourcePublishedAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  summary!: string | null;

  @OneToMany(() => LawArticle, (article) => article.law)
  articles!: LawArticle[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
