import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertOperationSchema, SUPPORTED_MODELS } from "@shared/schema";
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN);

export async function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.get("/api/operations", async (req, res) => {
    const operations = await storage.getOperations();
    res.json(operations);
  });

  app.get("/api/operations/:id", async (req, res) => {
    const operation = await storage.getOperation(Number(req.params.id));
    if (!operation) {
      res.status(404).json({ message: "Operation not found" });
      return;
    }
    res.json(operation);
  });

  app.post("/api/operations", async (req, res) => {
    const parsed = insertOperationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ 
        message: "Invalid operation data",
        details: parsed.error.message
      });
      return;
    }

    // Validate model exists
    const models = SUPPORTED_MODELS[parsed.data.type];
    if (!models.find(m => m.id === parsed.data.modelId)) {
      res.status(400).json({ message: "Invalid model" });
      return;
    }

    try {
      let result;
      const input = parsed.data.input;

      // For image operations, extract base64 data
      const isImageOperation = parsed.data.type === "caption" || parsed.data.type === "classify";
      const imageData = isImageOperation ? input.split(",")[1] : input;

      switch (parsed.data.type) {
        case "caption":
          result = await hf.imageToText({
            model: parsed.data.modelId,
            data: Buffer.from(imageData, "base64")
          });
          break;
        case "classify":
          result = await hf.imageClassification({
            model: parsed.data.modelId,
            data: Buffer.from(imageData, "base64")
          });
          break;
        case "generate":
          result = await hf.textGeneration({
            model: parsed.data.modelId,
            inputs: input,
            parameters: {
              max_length: 100,
              temperature: 0.7
            }
          });
          break;
        case "sentiment":
          result = await hf.textClassification({
            model: parsed.data.modelId,
            inputs: input
          });
          break;
        default:
          res.status(400).json({ message: "Invalid operation type" });
          return;
      }

      const operation = await storage.createOperation({
        type: parsed.data.type,
        input: parsed.data.input,
        modelId: parsed.data.modelId,
        result
      });

      res.json(operation);
    } catch (error: any) {
      console.error("Hugging Face API error:", error);
      res.status(500).json({ 
        message: "Error processing request",
        details: error.message 
      });
    }
  });

  return httpServer;
}