import { useState } from "react";
import { useLocation } from "wouter";
import { useWorkspace, useInviteToWorkspace } from "../hooks/use-workspace";
import { useDocuments, useCreateDocument } from "../hooks/use-document";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Users, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WorkspacePage({ params }: { params: { id: string } }) {
  const workspaceId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { data: workspace, isLoading: workspaceLoading } = useWorkspace(workspaceId);
  const { data: documents, isLoading: documentsLoading } = useDocuments(workspaceId);
  const createDocument = useCreateDocument();
  const inviteToWorkspace = useInviteToWorkspace();
  const { toast } = useToast();
  const [newDocOpen, setNewDocOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  const handleCreateDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;

    try {
      const doc = await createDocument.mutateAsync({
        name,
        type,
        workspaceId,
        content: type === "document" ? { blocks: [] } : { cells: [] },
      });
      setNewDocOpen(false);
      setLocation(`/document/${doc.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create document",
        variant: "destructive",
      });
    }
  };

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;

    try {
      await inviteToWorkspace.mutateAsync({
        workspaceId,
        email,
        role,
      });
      setInviteOpen(false);
      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  if (workspaceLoading || documentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8 gap-4">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{workspace?.name}</h1>
          <div className="ml-auto flex gap-4">
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>メンバーを招待</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <Label htmlFor="email">メールアドレス</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="role">権限</Label>
                    <Select name="role" defaultValue="editor">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="editor">編集者</SelectItem>
                        <SelectItem value="viewer">閲覧者</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={inviteToWorkspace.isPending}>
                    {inviteToWorkspace.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    招待を送信
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={newDocOpen} onOpenChange={setNewDocOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新規ドキュメントの作成</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDocument} className="space-y-4">
                  <div>
                    <Label htmlFor="name">名前</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="type">種類</Label>
                    <Select name="type" defaultValue="document">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">ドキュメント</SelectItem>
                        <SelectItem value="spreadsheet">スプレッドシート</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={createDocument.isPending}>
                    {createDocument.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    作成
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents?.map((document) => (
            <Card
              key={document.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setLocation(`/document/${document.id}`)}
            >
              <CardHeader>
                <CardTitle>{document.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Type: {document.type}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
