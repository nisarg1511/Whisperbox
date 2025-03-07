import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConfessionSchema, insertSecretMessageSchema } from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes and middleware
  setupAuth(app);

  app.get("/api/confessions", async (_req, res) => {
    const confessions = await storage.getConfessions();
    res.json(confessions);
  });

  app.get("/api/my/confessions", async (req, res) => {
    const firebaseUid = req.headers["x-firebase-uid"] as string;
    if (!firebaseUid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const confessions = await storage.getUserConfessions(firebaseUid);
    res.json(confessions);
  });

  app.post("/api/confessions", async (req, res) => {
    const result = insertConfessionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid confession data" });
    }

    const firebaseUid = req.headers["x-firebase-uid"] as string;
    const confession = await storage.createConfession(result.data, firebaseUid);
    res.status(201).json(confession);
  });

  app.patch("/api/confessions/:id", async (req, res) => {
    const firebaseUid = req.headers["x-firebase-uid"] as string;
    if (!firebaseUid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = insertConfessionSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid confession data" });
    }

    await storage.updateUserConfession(Number(req.params.id), firebaseUid, result.data);
    res.status(200).send();
  });

  app.delete("/api/confessions/:id", async (req, res) => {
    const firebaseUid = req.headers["x-firebase-uid"] as string;
    if (!firebaseUid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await storage.deleteUserConfession(Number(req.params.id), firebaseUid);
    res.status(204).send();
  });

  app.post("/api/secrets", async (req, res) => {
    const result = insertSecretMessageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid message data" });
    }

    const firebaseUid = req.headers["x-firebase-uid"] as string;
    const message = await storage.createSecretMessage(result.data, firebaseUid);
    res.status(201).json({ token: message.token });
  });

  app.get("/api/my/secrets", async (req, res) => {
    const firebaseUid = req.headers["x-firebase-uid"] as string;
    if (!firebaseUid) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const messages = await storage.getUserSecretMessages(firebaseUid);
    res.json(messages);
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

  app.delete("/api/secrets/:id", async (req, res) => {
    const firebaseUid = req.headers["x-firebase-uid"] as string;
    if (!firebaseUid) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await storage.deleteUserSecretMessage(Number(req.params.id), firebaseUid);
    res.status(204).send();
  });

  const httpServer = createServer(app);
  return httpServer;
}