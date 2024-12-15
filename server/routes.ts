import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupWebSocket } from "./socket";
import { db } from "@db";
import {
  documents,
  workspaces,
  workspaceMembers,
  users,
} from "@db/schema";
import { eq, and } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Workspaces
  app.get("/api/workspaces", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    const userWorkspaces = await db
      .select()
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(eq(workspaceMembers.userId, req.user.id));

    res.json(userWorkspaces);
  });

  app.post("/api/workspaces", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    const { name, description } = req.body;

    const [workspace] = await db
      .insert(workspaces)
      .values({
        name,
        description,
        ownerId: req.user.id,
      })
      .returning();

    await db.insert(workspaceMembers).values({
      workspaceId: workspace.id,
      userId: req.user.id,
      role: "owner",
    });

    res.json(workspace);
  });

  app.post("/api/workspaces/:id/invite", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    const { email, role } = req.body;
    const workspaceId = parseInt(req.params.id);

    const [invitedUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!invitedUser) {
      return res.status(404).send("User not found");
    }

    const [member] = await db.insert(workspaceMembers)
      .values({
        workspaceId,
        userId: invitedUser.id,
        role,
      })
      .returning();

    res.json(member);
  });

  // Documents
  app.get("/api/workspaces/:id/documents", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    const workspaceId = parseInt(req.params.id);

    const [member] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, req.user.id)
        )
      )
      .limit(1);

    if (!member) {
      return res.status(403).send("Not a member of this workspace");
    }

    const docs = await db
      .select()
      .from(documents)
      .where(eq(documents.workspaceId, workspaceId));

    res.json(docs);
  });

  app.post("/api/documents", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Unauthorized");
    }

    const { name, type, content, workspaceId } = req.body;

    const [document] = await db
      .insert(documents)
      .values({
        name,
        type,
        content,
        workspaceId,
        createdBy: req.user.id,
      })
      .returning();

    res.json(document);
  });

  const httpServer = createServer(app);
  setupWebSocket(httpServer);

  return httpServer;
}
