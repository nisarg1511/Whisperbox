import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const confessions = pgTable("confessions", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const secretMessages = pgTable("secret_messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  token: text("token").notNull().unique(),
  viewed: boolean("viewed").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertConfessionSchema = createInsertSchema(confessions).pick({
  content: true,
}).extend({
  content: z.string().min(1).max(1000),
});

export const insertSecretMessageSchema = createInsertSchema(secretMessages).pick({
  content: true,
}).extend({
  content: z.string().min(1).max(5000),
});

export type InsertConfession = z.infer<typeof insertConfessionSchema>;
export type Confession = typeof confessions.$inferSelect;

export type InsertSecretMessage = z.infer<typeof insertSecretMessageSchema>;
export type SecretMessage = typeof secretMessages.$inferSelect;
