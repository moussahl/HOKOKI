import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1760000000000 implements MigrationInterface {
  name = 'InitSchema1760000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('citizen', 'expert', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."conversations_status_enum" AS ENUM('open', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."messages_sender_enum" AS ENUM('user', 'assistant', 'expert', 'system')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."procedure_progress_status_enum" AS ENUM('not_started', 'in_progress', 'completed', 'blocked')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('law_update', 'procedure_reminder', 'expert_message')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."expert_sessions_status_enum" AS ENUM('requested', 'confirmed', 'completed', 'cancelled')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "full_name" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'citizen',
        "preferred_language" character varying NOT NULL DEFAULT 'ar',
        "is_verified_expert" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "laws" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "slug" character varying NOT NULL,
        "title" character varying NOT NULL,
        "category" character varying,
        "language" character varying NOT NULL DEFAULT 'ar',
        "source_url" character varying NOT NULL,
        "source_published_at" TIMESTAMP WITH TIME ZONE,
        "summary" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_laws_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_laws_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "law_articles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "article_number" character varying NOT NULL,
        "title" character varying,
        "original_text" text NOT NULL,
        "simple_text" text,
        "embedding_ref" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "law_id" uuid NOT NULL,
        CONSTRAINT "UQ_law_article_number" UNIQUE ("law_id", "article_number"),
        CONSTRAINT "PK_law_articles_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_law_articles_law" FOREIGN KEY ("law_id") REFERENCES "laws"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" character varying,
        "status" "public"."conversations_status_enum" NOT NULL DEFAULT 'open',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "PK_conversations_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_conversations_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "sender" "public"."messages_sender_enum" NOT NULL,
        "content" text NOT NULL,
        "source_articles" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "conversation_id" uuid NOT NULL,
        CONSTRAINT "PK_messages_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_messages_conversation" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "procedures" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "key" character varying NOT NULL,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_procedures_key" UNIQUE ("key"),
        CONSTRAINT "PK_procedures_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "procedure_steps" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "step_order" integer NOT NULL,
        "title" character varying NOT NULL,
        "description" text,
        "required_documents" text array NOT NULL DEFAULT '{}',
        "location_hint" character varying,
        "procedure_id" uuid NOT NULL,
        CONSTRAINT "UQ_procedure_step_order" UNIQUE ("procedure_id", "step_order"),
        CONSTRAINT "PK_procedure_steps_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_procedure_steps_procedure" FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "procedure_progress" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "current_step_order" integer NOT NULL DEFAULT 1,
        "status" "public"."procedure_progress_status_enum" NOT NULL DEFAULT 'not_started',
        "advice_note" text,
        "started_at" TIMESTAMP WITH TIME ZONE,
        "completed_at" TIMESTAMP WITH TIME ZONE,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "user_id" uuid NOT NULL,
        "procedure_id" uuid NOT NULL,
        CONSTRAINT "UQ_user_procedure_progress" UNIQUE ("user_id", "procedure_id"),
        CONSTRAINT "PK_procedure_progress_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_procedure_progress_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_procedure_progress_procedure" FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_interests" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "topic" character varying NOT NULL,
        "is_subscribed" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        CONSTRAINT "UQ_user_interest_topic" UNIQUE ("user_id", "topic"),
        CONSTRAINT "PK_user_interests_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_interests_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "type" "public"."notifications_type_enum" NOT NULL,
        "title" character varying NOT NULL,
        "body" text NOT NULL,
        "payload" jsonb,
        "read_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "expert_sessions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "topic" character varying,
        "notes" text,
        "scheduled_at" TIMESTAMP WITH TIME ZONE,
        "status" "public"."expert_sessions_status_enum" NOT NULL DEFAULT 'requested',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "citizen_id" uuid NOT NULL,
        "expert_id" uuid,
        CONSTRAINT "PK_expert_sessions_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_expert_sessions_citizen" FOREIGN KEY ("citizen_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_expert_sessions_expert" FOREIGN KEY ("expert_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "expert_sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_interests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "procedure_progress"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "procedure_steps"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "procedures"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "conversations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "law_articles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "laws"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."expert_sessions_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."notifications_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."procedure_progress_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."messages_sender_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."conversations_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}
