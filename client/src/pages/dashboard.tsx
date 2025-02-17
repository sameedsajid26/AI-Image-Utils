import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DashboardShell from "@/components/layout/dashboard-shell";
import FileUpload from "@/components/file-upload";
import ModelSelector from "@/components/model-selector";
import ResultDisplay from "@/components/result-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Operation, SUPPORTED_MODELS } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<keyof typeof SUPPORTED_MODELS>("caption");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [result, setResult] = useState<Operation | null>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/operations", data);
      return res.json();
    },
    onSuccess: (data) => {
      setResult(data);
      toast({
        title: "Success",
        description: "Operation completed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (!selectedModel) {
      toast({
        title: "Error",
        description: "Please select a model",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "caption" || activeTab === "classify") {
      if (!selectedFile) {
        toast({
          title: "Error",
          description: "Please select a file",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();

      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read the selected file",
          variant: "destructive",
        });
      };

      reader.onload = async (e) => {
        if (!e.target?.result) {
          toast({
            title: "Error",
            description: "Failed to process the image",
            variant: "destructive",
          });
          return;
        }

        try {
          mutation.mutate({
            type: activeTab,
            modelId: selectedModel,
            input: e.target.result
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to process the image",
            variant: "destructive",
          });
        }
      };

      reader.readAsDataURL(selectedFile);
    } else {
      if (!textInput.trim()) {
        toast({
          title: "Error",
          description: "Please enter some text",
          variant: "destructive",
        });
        return;
      }

      mutation.mutate({
        type: activeTab,
        modelId: selectedModel,
        input: textInput.trim()
      });
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">AI Swiss Army Knife</h1>
          <p className="text-muted-foreground">
            Process images and text using state-of-the-art AI models
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={(v) => {
          setActiveTab(v as keyof typeof SUPPORTED_MODELS);
          setResult(null);
          setSelectedModel("");
          setSelectedFile(null);
          setTextInput("");
        }}>
          <TabsList className="grid grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="caption">Image Captioning</TabsTrigger>
            <TabsTrigger value="classify">Image Classification</TabsTrigger>
            <TabsTrigger value="generate">Text Generation</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="caption">
            <div className="space-y-2">
              <FileUpload
                onFileSelect={(file) => {
                  setSelectedFile(file);
                  setResult(null);
                }}
                accept={{ "image/*": [] }}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="classify">
            <div className="space-y-2">
              <FileUpload
                onFileSelect={(file) => {
                  setSelectedFile(file);
                  setResult(null);
                }}
                accept={{ "image/*": [] }}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="generate">
            <div className="space-y-2">
              <Textarea
                placeholder="Enter text prompt..."
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  setResult(null);
                }}
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="sentiment">
            <div className="space-y-2">
              <Textarea
                placeholder="Enter text to analyze..."
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  setResult(null);
                }}
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>
          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Model</label>
              <ModelSelector
                type={activeTab}
                value={selectedModel}
                onChange={setSelectedModel}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process"
              )}
            </Button>
          </div>
        </Tabs>

        {mutation.isPending && (
          <Card className="p-8 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Processing your request...
            </p>
          </Card>
        )}

        {result && <ResultDisplay operation={result} />}
      </div>
    </DashboardShell>
  );
}