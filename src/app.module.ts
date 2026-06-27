import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
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
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 10 },
      { name: 'long', ttl: 60_000, limit: 200 },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (config: ConfigService) => {
        console.log('HOST =', config.get('DB_HOST'));
        console.log('USER =', config.get('DB_USERNAME'));

        return {
          type: 'postgres',

          host: config.get('DB_HOST'),

          port: Number(config.get('DB_PORT', '5432')),

          username: config.get('DB_USERNAME'),

          password: config.get('DB_PASSWORD'),

          database: config.get('DB_NAME'),

          entities: [join(__dirname, '**', '*.entity.{ts,js}')],

          autoLoadEntities: true,

          synchronize: false,

          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
    }),
    LawsModule,
    AuthModule,
    ConversationsModule,
    ProceduresModule,
    ExpertSessionsModule,
    InterestsModule,
    NotificationsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
