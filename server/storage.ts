import { nanoid } from "nanoid";
import {
  type Confession,
  type InsertConfession,
  type SecretMessage,
  type InsertSecretMessage,
  confessions,
  secretMessages,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, lte } from "drizzle-orm";

export interface IStorage {
  getConfessions(): Promise<Confession[]>;
  createConfession(confession: InsertConfession): Promise<Confession>;

  createSecretMessage(message: InsertSecretMessage): Promise<SecretMessage>;
  getSecretMessage(token: string): Promise<SecretMessage | undefined>;
  markMessageAsViewed(token: string): Promise<void>;
  deleteExpiredMessages(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getConfessions(): Promise<Confession[]> {
    return await db
      .select()
      .from(confessions)
      .orderBy(desc(confessions.createdAt))
      .limit(50);
  }

  async createConfession(confession: InsertConfession): Promise<Confession> {
    const [created] = await db
      .insert(confessions)
      .values({
        content: confession.content,
      })
      .returning();
    return created;
  }

  async createSecretMessage(message: InsertSecretMessage): Promise<SecretMessage> {
    const [created] = await db
      .insert(secretMessages)
      .values({
        content: message.content,
        token: nanoid(32),
        viewed: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      })
      .returning();
    return created;
  }

  async getSecretMessage(token: string): Promise<SecretMessage | undefined> {
    const [message] = await db
      .select()
      .from(secretMessages)
      .where(eq(secretMessages.token, token));
    return message;
  }

  async markMessageAsViewed(token: string): Promise<void> {
    await db
      .delete(secretMessages)
      .where(eq(secretMessages.token, token));
  }

  async deleteExpiredMessages(): Promise<void> {
    await db
      .delete(secretMessages)
      .where(lte(secretMessages.expiresAt, new Date()));
  }
}

export const storage = new DatabaseStorage();

// Run cleanup every minute
setInterval(() => {
  storage.deleteExpiredMessages();
}, 60 * 1000);