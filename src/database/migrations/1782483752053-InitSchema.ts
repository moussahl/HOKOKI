import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1782483752053 implements MigrationInterface {
    name = 'InitSchema1782483752053'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."messages_sender_enum" AS ENUM('user', 'assistant', 'expert', 'system')`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sender" "public"."messages_sender_enum" NOT NULL, "content" text NOT NULL, "source_articles" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "conversation_id" uuid NOT NULL, CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."expert_sessions_status_enum" AS ENUM('requested', 'confirmed', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "expert_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "topic" character varying, "notes" text, "scheduled_at" TIMESTAMP WITH TIME ZONE, "status" "public"."expert_sessions_status_enum" NOT NULL DEFAULT 'requested', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "citizen_id" uuid NOT NULL, "expert_id" uuid, CONSTRAINT "PK_35f2cd2f8b368da6f67da76038b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('law_update', 'procedure_reminder', 'expert_message')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."notifications_type_enum" NOT NULL, "title" character varying NOT NULL, "body" text NOT NULL, "payload" jsonb, "read_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "procedure_steps" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "step_order" integer NOT NULL, "title" character varying NOT NULL, "description" text, "required_documents" text array NOT NULL DEFAULT '{}', "location_hint" character varying, "procedure_id" uuid NOT NULL, CONSTRAINT "UQ_procedure_step_order" UNIQUE ("procedure_id", "step_order"), CONSTRAINT "PK_78ec04e53a1e71dd42b2cd452fd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "procedures" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0ebf8d1f11fa73ca256a04b4d19" UNIQUE ("key"), CONSTRAINT "PK_e7775bab78f27b4c47580b6cb4b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."procedure_progress_status_enum" AS ENUM('not_started', 'in_progress', 'completed', 'blocked')`);
        await queryRunner.query(`CREATE TABLE "procedure_progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "current_step_order" integer NOT NULL DEFAULT '1', "status" "public"."procedure_progress_status_enum" NOT NULL DEFAULT 'not_started', "advice_note" text, "started_at" TIMESTAMP WITH TIME ZONE, "completed_at" TIMESTAMP WITH TIME ZONE, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "procedure_id" uuid NOT NULL, CONSTRAINT "UQ_user_procedure_progress" UNIQUE ("user_id", "procedure_id"), CONSTRAINT "PK_c570095472c813cdbc2248f7585" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_interests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "topic" character varying NOT NULL, "is_subscribed" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, CONSTRAINT "UQ_user_interest_topic" UNIQUE ("user_id", "topic"), CONSTRAINT "PK_cdfda991bb843bc8736cde962cc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('citizen', 'expert', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "full_name" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'citizen', "preferred_language" character varying NOT NULL DEFAULT 'ar', "is_verified_expert" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."conversations_status_enum" AS ENUM('open', 'closed')`);
        await queryRunner.query(`CREATE TABLE "conversations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying, "status" "public"."conversations_status_enum" NOT NULL DEFAULT 'open', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "PK_ee34f4f7ced4ec8681f26bf04ef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "laws" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying NOT NULL, "title" character varying NOT NULL, "category" character varying, "language" character varying NOT NULL DEFAULT 'ar', "source_url" character varying NOT NULL, "source_published_at" TIMESTAMP WITH TIME ZONE, "summary" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_387e4d2a8295d05dd703a0e8706" UNIQUE ("slug"), CONSTRAINT "PK_44cb27c4edaa03da5e06d635432" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "law_articles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "article_number" character varying NOT NULL, "title" character varying, "original_text" text NOT NULL, "simple_text" text, "embedding_ref" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "law_id" uuid NOT NULL, CONSTRAINT "UQ_law_article_number" UNIQUE ("law_id", "article_number"), CONSTRAINT "PK_880e41fc7e2a51637db5f87fd75" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expert_sessions" ADD CONSTRAINT "FK_1b109d9d380347d2e434365f843" FOREIGN KEY ("citizen_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expert_sessions" ADD CONSTRAINT "FK_7ca27e8bfdf33002c5681d720b5" FOREIGN KEY ("expert_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "procedure_steps" ADD CONSTRAINT "FK_bd927e7767348c08a2f9ad62580" FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "procedure_progress" ADD CONSTRAINT "FK_23fe2d897ea6a2a88fb29012fe5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "procedure_progress" ADD CONSTRAINT "FK_1a48553cc5a74d054fe1c19f099" FOREIGN KEY ("procedure_id") REFERENCES "procedures"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_interests" ADD CONSTRAINT "FK_cb0511a8fabd1a2ac9912f7a9aa" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "conversations" ADD CONSTRAINT "FK_3a9ae579e61e81cc0e989afeb4a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "law_articles" ADD CONSTRAINT "FK_e75b8ed0563ad0aa525c1a10cdb" FOREIGN KEY ("law_id") REFERENCES "laws"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "law_articles" DROP CONSTRAINT "FK_e75b8ed0563ad0aa525c1a10cdb"`);
        await queryRunner.query(`ALTER TABLE "conversations" DROP CONSTRAINT "FK_3a9ae579e61e81cc0e989afeb4a"`);
        await queryRunner.query(`ALTER TABLE "user_interests" DROP CONSTRAINT "FK_cb0511a8fabd1a2ac9912f7a9aa"`);
        await queryRunner.query(`ALTER TABLE "procedure_progress" DROP CONSTRAINT "FK_1a48553cc5a74d054fe1c19f099"`);
        await queryRunner.query(`ALTER TABLE "procedure_progress" DROP CONSTRAINT "FK_23fe2d897ea6a2a88fb29012fe5"`);
        await queryRunner.query(`ALTER TABLE "procedure_steps" DROP CONSTRAINT "FK_bd927e7767348c08a2f9ad62580"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
        await queryRunner.query(`ALTER TABLE "expert_sessions" DROP CONSTRAINT "FK_7ca27e8bfdf33002c5681d720b5"`);
        await queryRunner.query(`ALTER TABLE "expert_sessions" DROP CONSTRAINT "FK_1b109d9d380347d2e434365f843"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_3bc55a7c3f9ed54b520bb5cfe23"`);
        await queryRunner.query(`DROP TABLE "law_articles"`);
        await queryRunner.query(`DROP TABLE "laws"`);
        await queryRunner.query(`DROP TABLE "conversations"`);
        await queryRunner.query(`DROP TYPE "public"."conversations_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "user_interests"`);
        await queryRunner.query(`DROP TABLE "procedure_progress"`);
        await queryRunner.query(`DROP TYPE "public"."procedure_progress_status_enum"`);
        await queryRunner.query(`DROP TABLE "procedures"`);
        await queryRunner.query(`DROP TABLE "procedure_steps"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP TABLE "expert_sessions"`);
        await queryRunner.query(`DROP TYPE "public"."expert_sessions_status_enum"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TYPE "public"."messages_sender_enum"`);
    }

}
