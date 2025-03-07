import { nanoid } from "nanoid";
import {
  type Confession,
  type InsertConfession,
  type SecretMessage,
  type InsertSecretMessage,
} from "@shared/schema";

export interface IStorage {
  getConfessions(): Promise<Confession[]>;
  createConfession(confession: InsertConfession): Promise<Confession>;
  
  createSecretMessage(message: InsertSecretMessage): Promise<SecretMessage>;
  getSecretMessage(token: string): Promise<SecretMessage | undefined>;
  markMessageAsViewed(token: string): Promise<void>;
  deleteExpiredMessages(): Promise<void>;
}

export class MemStorage implements IStorage {
  private confessions: Map<number, Confession>;
  private secretMessages: Map<number, SecretMessage>;
  private confessionId: number;
  private messageId: number;

  constructor() {
    this.confessions = new Map();
    this.secretMessages = new Map();
    this.confessionId = 1;
    this.messageId = 1;
  }

  async getConfessions(): Promise<Confession[]> {
    return Array.from(this.confessions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 50); // Only return latest 50 confessions
  }

  async createConfession(confession: InsertConfession): Promise<Confession> {
    const id = this.confessionId++;
    const created: Confession = {
      id,
      content: confession.content,
      createdAt: new Date(),
    };
    this.confessions.set(id, created);
    return created;
  }

  async createSecretMessage(message: InsertSecretMessage): Promise<SecretMessage> {
    const id = this.messageId++;
    const created: SecretMessage = {
      id,
      content: message.content,
      token: nanoid(32),
      viewed: false,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      createdAt: new Date(),
    };
    this.secretMessages.set(id, created);
    return created;
  }

  async getSecretMessage(token: string): Promise<SecretMessage | undefined> {
    return Array.from(this.secretMessages.values()).find(msg => msg.token === token);
  }

  async markMessageAsViewed(token: string): Promise<void> {
    const message = await this.getSecretMessage(token);
    if (!message) return;
    
    // Delete the message once viewed
    this.secretMessages.delete(message.id);
  }

  async deleteExpiredMessages(): Promise<void> {
    const now = new Date();
    for (const [id, message] of this.secretMessages.entries()) {
      if (message.expiresAt <= now) {
        this.secretMessages.delete(id);
      }
    }
  }
}

export const storage = new MemStorage();

// Run cleanup every minute
setInterval(() => {
  storage.deleteExpiredMessages();
}, 60 * 1000);
