CREATE TYPE "public"."mencion_ciencias" AS ENUM('ninguna', 'biologia', 'fisica', 'quimica');--> statement-breakpoint
CREATE TYPE "public"."paes_date_status" AS ENUM('Próximo', 'Programado', 'Finalizado');--> statement-breakpoint
CREATE TYPE "public"."paes_subject" AS ENUM('lectora', 'matematica', 'historia', 'ciencias');--> statement-breakpoint
CREATE TYPE "public"."score_factor" AS ENUM('lectora', 'matematica', 'historia', 'ciencias', 'nem', 'ranking');--> statement-breakpoint
CREATE TYPE "public"."score_source" AS ENUM('manual', 'paes_attempt');--> statement-breakpoint
CREATE TYPE "public"."scrape_status" AS ENUM('success', 'failure', 'partial');--> statement-breakpoint
CREATE TYPE "public"."scrape_target" AS ENUM('universities', 'careers', 'paes_dates');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "areas" (
	"code" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "universities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"full_name" text NOT NULL,
	"city" text NOT NULL,
	"color" text NOT NULL,
	"website_url" text NOT NULL,
	"last_scraped_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "careers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"university_id" uuid NOT NULL,
	"area_code" text NOT NULL,
	"external_code" text NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"degree" text NOT NULL,
	"duration" text NOT NULL,
	"regimen" text NOT NULL,
	"vacantes" integer NOT NULL,
	"first_selected_score" numeric(6, 2),
	"cutoff_score" numeric(6, 2),
	"profile" text NOT NULL,
	"weights" jsonb NOT NULL,
	"source_url" text NOT NULL,
	"last_scraped_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "careers_university_external_code_unique" UNIQUE("university_id","external_code")
);
--> statement-breakpoint
CREATE TABLE "paes_dates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"phase" text NOT NULL,
	"title" text NOT NULL,
	"date_start" date,
	"date_end" date,
	"date_label" text NOT NULL,
	"status" "paes_date_status" NOT NULL,
	"icon" text NOT NULL,
	"source_url" text NOT NULL,
	"last_scraped_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "scrape_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target" "scrape_target" NOT NULL,
	"status" "scrape_status" NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"finished_at" timestamp with time zone,
	"items_updated" integer DEFAULT 0 NOT NULL,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "paes_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" "paes_subject" NOT NULL,
	"mencion" "mencion_ciencias" DEFAULT 'ninguna' NOT NULL,
	"text" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "paes_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subject" "paes_subject" NOT NULL,
	"mencion" "mencion_ciencias" DEFAULT 'ninguna' NOT NULL,
	"score" numeric(6, 2) NOT NULL,
	"correct_count" integer NOT NULL,
	"total_count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "paes_attempts_user_subject_mencion_unique" UNIQUE("user_id","subject","mencion")
);
--> statement-breakpoint
CREATE TABLE "paes_attempt_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"factor" "score_factor" NOT NULL,
	"value" numeric(6, 2) NOT NULL,
	"source" "score_source" NOT NULL,
	"attempt_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_scores_user_factor_unique" UNIQUE("user_id","factor"),
	CONSTRAINT "user_scores_value_range" CHECK ("user_scores"."value" >= 100 AND "user_scores"."value" <= 1000)
);
--> statement-breakpoint
CREATE TABLE "user_favorites" (
	"user_id" uuid NOT NULL,
	"career_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_favorites_user_id_career_id_pk" PRIMARY KEY("user_id","career_id")
);
--> statement-breakpoint
CREATE TABLE "vocational_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"text" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vocational_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"label" text NOT NULL,
	"area_code" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vocational_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"affinity" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vocational_attempt_answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"option_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "careers" ADD CONSTRAINT "careers_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "careers" ADD CONSTRAINT "careers_area_code_areas_code_fk" FOREIGN KEY ("area_code") REFERENCES "public"."areas"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paes_attempts" ADD CONSTRAINT "paes_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paes_attempt_answers" ADD CONSTRAINT "paes_attempt_answers_attempt_id_paes_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."paes_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "paes_attempt_answers" ADD CONSTRAINT "paes_attempt_answers_question_id_paes_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."paes_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_scores" ADD CONSTRAINT "user_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_scores" ADD CONSTRAINT "user_scores_attempt_id_paes_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."paes_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD CONSTRAINT "user_favorites_career_id_careers_id_fk" FOREIGN KEY ("career_id") REFERENCES "public"."careers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocational_options" ADD CONSTRAINT "vocational_options_question_id_vocational_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."vocational_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocational_options" ADD CONSTRAINT "vocational_options_area_code_areas_code_fk" FOREIGN KEY ("area_code") REFERENCES "public"."areas"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocational_attempts" ADD CONSTRAINT "vocational_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocational_attempt_answers" ADD CONSTRAINT "vocational_attempt_answers_attempt_id_vocational_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."vocational_attempts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocational_attempt_answers" ADD CONSTRAINT "vocational_attempt_answers_question_id_vocational_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."vocational_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocational_attempt_answers" ADD CONSTRAINT "vocational_attempt_answers_option_id_vocational_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."vocational_options"("id") ON DELETE cascade ON UPDATE no action;