CREATE TABLE "stores" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "stores_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"custom_domain" text UNIQUE,
	"plan" text DEFAULT 'free' NOT NULL,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
