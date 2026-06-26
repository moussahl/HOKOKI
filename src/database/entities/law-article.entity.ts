import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Law } from './law.entity';

@Entity({ name: 'law_articles' })
@Unique('UQ_law_article_number', ['law', 'articleNumber'])
export class LawArticle {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Law, (law) => law.articles, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'law_id' })
  law!: Law;

  @Column({ name: 'article_number' })
  articleNumber!: string;

  @Column({ type: 'varchar', nullable: true })
  title!: string | null;

  @Column({ name: 'original_text', type: 'text' })
  originalText!: string;

  @Column({ name: 'simple_text', type: 'text', nullable: true })
  simpleText!: string | null;

  @Column({ name: 'embedding_ref', type: 'varchar', nullable: true })
  embeddingRef!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
