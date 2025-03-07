import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConfessionSchema, insertSecretMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/confessions", async (_req, res) => {
    const confessions = await storage.getConfessions();
    res.json(confessions);
  });

  app.post("/api/confessions", async (req, res) => {
    const result = insertConfessionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid confession data" });
    }

    const confession = await storage.createConfession(result.data);
    res.status(201).json(confession);
  });

  app.post("/api/secrets", async (req, res) => {
    const result = insertSecretMessageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid message data" });
    }

    const message = await storage.createSecretMessage(result.data);
    res.status(201).json({ token: message.token });
  });

  app.get("/api/secrets/:token", async (req, res) => {
    const token = req.params.token;
    const message = await storage.getSecretMessage(token);

    if (!message) {
      return res.status(404).json({ message: "Message not found or already viewed" });
    }

    if (message.expiresAt < new Date()) {
      await storage.markMessageAsViewed(token);
      return res.status(410).json({ message: "Message has expired" });
    }

    if (message.viewed) {
      return res.status(410).json({ message: "Message has already been viewed" });
    }

    await storage.markMessageAsViewed(token);
    res.json({ 
      content: message.content,
      expiresAt: message.expiresAt.toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
