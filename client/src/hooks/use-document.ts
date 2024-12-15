import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InsertDocument, SelectDocument } from "@db/schema";
import { socket } from "../lib/socket";

export function useDocuments(workspaceId: number) {
  return useQuery<SelectDocument[]>({
    queryKey: [`/api/workspaces/${workspaceId}/documents`],
  });
}

export function useDocument(id: number) {
  return useQuery<SelectDocument>({
    queryKey: [`/api/documents/${id}`],
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (document: InsertDocument) => {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(document),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/workspaces/${variables.workspaceId}/documents`],
      });
    },
  });
}

export function useUpdateDocument() {
  return useMutation({
    mutationFn: async ({
      id,
      content,
    }: {
      id: number;
      content: any;
    }) => {
      socket.emit("document:update", { id, content });
    },
  });
}
