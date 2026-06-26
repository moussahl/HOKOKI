import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LawsModule } from './laws/laws.module';
import { AuthModule } from './auth/auth.module';
import { ConversationsModule } from './conversations/conversations.module';
import { ProceduresModule } from './procedures/procedures.module';
import { ExpertSessionsModule } from './expert-sessions/expert-sessions.module';
import { InterestsModule } from './interests/interests.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'admin'),
        database: configService.get<string>('DB_NAME', 'hokoki'),
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        autoLoadEntities: true,
        synchronize:
          configService.get<string>('DB_SYNCHRONIZE', 'false') === 'true',
      }),
    }),
    LawsModule,
    AuthModule,
    ConversationsModule,
    ProceduresModule,
    ExpertSessionsModule,
    InterestsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
