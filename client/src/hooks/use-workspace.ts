import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InsertWorkspace, SelectWorkspace } from "@db/schema";

export function useWorkspaces() {
  return useQuery<SelectWorkspace[]>({
    queryKey: ["/api/workspaces"],
  });
}

export function useWorkspace(id: number) {
  return useQuery<SelectWorkspace>({
    queryKey: [`/api/workspaces/${id}`],
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workspace: InsertWorkspace) => {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workspace),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspaces"] });
    },
  });
}

export function useInviteToWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      workspaceId,
      email,
      role,
    }: {
      workspaceId: number;
      email: string;
      role: string;
    }) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: (_, { workspaceId }) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/workspaces/${workspaceId}`],
      });
    },
  });
}
