import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { ExpertSession } from './entities/expert-session.entity';
import { LawArticle } from './entities/law-article.entity';
import { Law } from './entities/law.entity';
import { Message } from './entities/message.entity';
import { Notification } from './entities/notification.entity';
import { ProcedureProgress } from './entities/procedure-progress.entity';
import { ProcedureStep } from './entities/procedure-step.entity';
import { Procedure } from './entities/procedure.entity';
import { UserInterest } from './entities/user-interest.entity';
import { User } from './entities/user.entity';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'hokoki',
  entities: [
    User,
    Law,
    LawArticle,
    Conversation,
    Message,
    Procedure,
    ProcedureStep,
    ProcedureProgress,
    UserInterest,
    Notification,
    ExpertSession,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: false,
});
