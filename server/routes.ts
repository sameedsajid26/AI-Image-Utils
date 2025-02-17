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
      res.status(400).json({ message: "Invalid operation data" });
      return;
    }

    // Validate model exists
    const models = SUPPORTED_MODELS[parsed.data.type as keyof typeof SUPPORTED_MODELS];
    if (!models.find(m => m.id === parsed.data.modelId)) {
      res.status(400).json({ message: "Invalid model" });
      return;
    }

    try {
      let result;
      switch (parsed.data.type) {
        case "caption":
          result = await hf.imageToText({
            model: parsed.data.modelId,
            data: parsed.data.input
          });
          break;
        case "classify":
          result = await hf.imageClassification({
            model: parsed.data.modelId,
            data: parsed.data.input
          });
          break;
        case "generate":
          result = await hf.textGeneration({
            model: parsed.data.modelId,
            inputs: parsed.data.input
          });
          break;
        case "sentiment":
          result = await hf.sentimentAnalysis({
            model: parsed.data.modelId,
            inputs: parsed.data.input
          });
          break;
        default:
          res.status(400).json({ message: "Invalid operation type" });
          return;
      }

      const operation = await storage.createOperation({
        ...parsed.data,
        result
      });
      
      res.json(operation);
    } catch (error) {
      res.status(500).json({ message: "Error processing request" });
    }
  });

  return httpServer;
}
