import { useState } from "react";
import { useLocation } from "wouter";
import { useWorkspaces, useCreateWorkspace } from "../hooks/use-workspace";
import { useUser } from "../hooks/use-user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const { data: workspaces, isLoading } = useWorkspaces();
  const { logout, user } = useUser();
  const createWorkspace = useCreateWorkspace();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateWorkspace = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    try {
      await createWorkspace.mutateAsync({
        name,
        description,
        ownerId: user!.id,
      });
      setIsOpen(false);
      toast({
        title: "Success",
        description: "Workspace created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create workspace",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">マイワークスペース</h1>
          <div className="flex gap-4">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  新規ワークスペース
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新規ワークスペースの作成</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateWorkspace} className="space-y-4">
                  <div>
                    <Label htmlFor="name">名前</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="description">説明</Label>
                    <Textarea id="description" name="description" />
                  </div>
                  <Button type="submit" disabled={createWorkspace.isPending}>
                    {createWorkspace.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    作成
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces?.map((workspace) => (
            <Card
              key={workspace.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setLocation(`/workspace/${workspace.id}`)}
            >
              <CardHeader>
                <CardTitle>{workspace.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {workspace.description || "No description"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
