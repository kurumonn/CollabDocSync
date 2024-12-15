import { Server } from "http";
import { Server as SocketServer } from "socket.io";
import { db } from "@db";
import { documents, documentHistory } from "@db/schema";
import { eq } from "drizzle-orm";

export function setupWebSocket(server: Server) {
  const io = new SocketServer(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    let currentDocument: number | null = null;

    socket.on("document:join", async (documentId: number) => {
      if (currentDocument) {
        socket.leave(`document:${currentDocument}`);
      }
      
      socket.join(`document:${documentId}`);
      currentDocument = documentId;
    });

    socket.on("document:update", async ({ id, content }) => {
      try {
        // Update current document content
        const [document] = await db
          .update(documents)
          .set({ content })
          .where(eq(documents.id, id))
          .returning();

        // Create history entry
        await db.insert(documentHistory).values({
          documentId: id,
          content,
          changedBy: (socket.request as any).session?.passport?.user,
        });

        // Broadcast to other users
        socket.to(`document:${id}`).emit("document:updated", content);
      } catch (error) {
        console.error("Error updating document:", error);
      }
    });

    socket.on("disconnect", () => {
      if (currentDocument) {
        socket.leave(`document:${currentDocument}`);
      }
    });
  });

  return io;
}
