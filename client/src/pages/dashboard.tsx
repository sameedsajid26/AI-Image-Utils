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
import { Operation, SUPPORTED_MODELS } from "@shared/schema";

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
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process request",
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
      reader.onload = async (e) => {
        mutation.mutate({
          type: activeTab,
          modelId: selectedModel,
          input: e.target?.result
        });
      };
      reader.readAsDataURL(selectedFile);
    } else {
      if (!textInput) {
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
        input: textInput
      });
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto space-y-8">
        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v as keyof typeof SUPPORTED_MODELS);
          setResult(null);
          setSelectedModel("");
        }}>
          <TabsList>
            <TabsTrigger value="caption">Image Captioning</TabsTrigger>
            <TabsTrigger value="classify">Image Classification</TabsTrigger>
            <TabsTrigger value="generate">Text Generation</TabsTrigger>
            <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="caption" className="space-y-4">
            <FileUpload
              onFileSelect={setSelectedFile}
              accept={{ "image/*": [] }}
            />
          </TabsContent>

          <TabsContent value="classify" className="space-y-4">
            <FileUpload
              onFileSelect={setSelectedFile}
              accept={{ "image/*": [] }}
            />
          </TabsContent>

          <TabsContent value="generate" className="space-y-4">
            <Textarea
              placeholder="Enter text prompt..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-4">
            <Textarea
              placeholder="Enter text to analyze..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
          </TabsContent>
        </Tabs>

        <ModelSelector
          type={activeTab}
          value={selectedModel}
          onChange={setSelectedModel}
        />

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Processing..." : "Process"}
        </Button>

        {result && <ResultDisplay operation={result} />}
      </div>
    </DashboardShell>
  );
}
