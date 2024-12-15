import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useDocument, useUpdateDocument } from "../hooks/use-document";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { socket } from "../lib/socket";

export default function DocumentPage({ params }: { params: { id: string } }) {
  const documentId = parseInt(params.id);
  const [, setLocation] = useLocation();
  const { data: document, isLoading } = useDocument(documentId);
  const updateDocument = useUpdateDocument();
  const { toast } = useToast();
  const [content, setContent] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (document) {
      setContent(document.content);
    }
  }, [document]);

  useEffect(() => {
    if (documentId) {
      socket.emit("document:join", documentId);

      socket.on("document:updated", (newContent: any) => {
        setContent(newContent);
      });

      return () => {
        socket.off("document:updated");
      };
    }
  }, [documentId]);

  const handleContentChange = (newContent: any) => {
    setContent(newContent);
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      await updateDocument.mutateAsync({
        id: documentId,
        content,
      });
      setIsDirty(false);
      toast({
        title: "Success",
        description: "Document saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation(`/workspace/${document.workspaceId}`)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">{document.name}</h1>
            <div className="ml-auto flex gap-4">
              <Button variant="outline" disabled={!isDirty} onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
              <Button variant="outline">
                <History className="h-4 w-4 mr-2" />
                履歴
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {document.type === "document" ? (
          <div className="prose max-w-none">
            <textarea
              className="w-full h-[calc(100vh-200px)] p-4 bg-card border rounded-lg resize-none focus:outline-none"
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => handleContentChange(JSON.parse(e.target.value))}
            />
          </div>
        ) : (
          <div className="border rounded-lg bg-card p-4">
            <textarea
              className="w-full h-[calc(100vh-200px)] font-mono resize-none focus:outline-none"
              value={JSON.stringify(content, null, 2)}
              onChange={(e) => handleContentChange(JSON.parse(e.target.value))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
