import { nanoid } from "nanoid";
import {
  type Confession,
  type InsertConfession,
  type SecretMessage,
  type InsertSecretMessage,
  confessions,
  secretMessages,
  type User,
  type InsertUser,
  users,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, lte, and } from "drizzle-orm";

export interface IStorage {
  getConfessions(): Promise<Confession[]>;
  getUserConfessions(firebaseUid: string): Promise<Confession[]>;
  createConfession(confession: InsertConfession, firebaseUid?: string): Promise<Confession>;

  createSecretMessage(message: InsertSecretMessage, firebaseUid?: string): Promise<SecretMessage>;
  getSecretMessage(token: string): Promise<SecretMessage | undefined>;
  getUserSecretMessages(firebaseUid: string): Promise<SecretMessage[]>;
  markMessageAsViewed(token: string): Promise<void>;
  deleteExpiredMessages(): Promise<void>;

  // User-related operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  deleteUserConfession(id: number, firebaseUid: string): Promise<void>;
  deleteUserSecretMessage(id: number, firebaseUid: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getConfessions(): Promise<Confession[]> {
    return await db
      .select()
      .from(confessions)
      .orderBy(desc(confessions.createdAt))
      .limit(50);
  }

  async getUserConfessions(firebaseUid: string): Promise<Confession[]> {
    return await db
      .select()
      .from(confessions)
      .where(eq(confessions.firebaseUid, firebaseUid))
      .orderBy(desc(confessions.createdAt));
  }

  async createConfession(confession: InsertConfession, firebaseUid?: string): Promise<Confession> {
    const [created] = await db
      .insert(confessions)
      .values({
        content: confession.content,
        firebaseUid: firebaseUid || null,
        isAnonymous: !firebaseUid,
      })
      .returning();
    return created;
  }

  async createSecretMessage(message: InsertSecretMessage, firebaseUid?: string): Promise<SecretMessage> {
    const [created] = await db
      .insert(secretMessages)
      .values({
        content: message.content,
        token: nanoid(32),
        viewed: false,
        firebaseUid: firebaseUid || null,
        isAnonymous: !firebaseUid,
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

  async getUserSecretMessages(firebaseUid: string): Promise<SecretMessage[]> {
    return await db
      .select()
      .from(secretMessages)
      .where(eq(secretMessages.firebaseUid, firebaseUid))
      .orderBy(desc(secretMessages.createdAt));
  }

  async markMessageAsViewed(token: string): Promise<void> {
    await db
      .update(secretMessages)
      .set({ viewed: true })
      .where(eq(secretMessages.token, token));
  }

  async deleteExpiredMessages(): Promise<void> {
    await db
      .delete(secretMessages)
      .where(lte(secretMessages.expiresAt, new Date()));
  }

  // User-related operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db
      .insert(users)
      .values(user)
      .returning();
    return created;
  }

  async deleteUserConfession(id: number, firebaseUid: string): Promise<void> {
    await db
      .delete(confessions)
      .where(
        and(
          eq(confessions.id, id),
          eq(confessions.firebaseUid, firebaseUid)
        )
      );
  }

  async deleteUserSecretMessage(id: number, firebaseUid: string): Promise<void> {
    await db
      .delete(secretMessages)
      .where(
        and(
          eq(secretMessages.id, id),
          eq(secretMessages.firebaseUid, firebaseUid)
        )
      );
  }
}

export const storage = new DatabaseStorage();

// Run cleanup every minute
setInterval(() => {
  storage.deleteExpiredMessages();
}, 60 * 1000);