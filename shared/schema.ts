import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const operations = pgTable("operations", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "caption", "classify", "generate", "sentiment"
  input: text("input").notNull(), // text input or image path
  modelId: text("model_id").notNull(),
  result: jsonb("result").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOperationSchema = z.object({
  type: z.enum(["caption", "classify", "generate", "sentiment"]),
  input: z.string(),
  modelId: z.string(),
  result: z.any()
});

export type InsertOperation = z.infer<typeof insertOperationSchema>;
export type Operation = typeof operations.$inferSelect;

export const SUPPORTED_MODELS = {
  caption: [
    { id: "Salesforce/blip-image-captioning-base", name: "BLIP Base" },
    { id: "Salesforce/blip-image-captioning-large", name: "BLIP Large" }
  ],
  classify: [
    { id: "microsoft/resnet-50", name: "ResNet-50" },
    { id: "google/vit-base-patch16-224", name: "ViT Base" }
  ],
  generate: [
    { id: "gpt2", name: "GPT-2" },
    { id: "facebook/opt-350m", name: "OPT 350M" }
  ],
  sentiment: [
    { id: "distilbert-base-uncased-finetuned-sst-2-english", name: "DistilBERT SST-2" },
    { id: "cardiffnlp/twitter-roberta-base-sentiment", name: "RoBERTa Twitter" }
  ]
} as const;