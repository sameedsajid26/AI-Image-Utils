import { operations, type Operation, type InsertOperation } from "@shared/schema";

export interface IStorage {
  getOperations(): Promise<Operation[]>;
  createOperation(op: InsertOperation): Promise<Operation>;
  getOperation(id: number): Promise<Operation | undefined>;
}

export class MemStorage implements IStorage {
  private operations: Map<number, Operation>;
  private currentId: number;

  constructor() {
    this.operations = new Map();
    this.currentId = 1;
  }

  async getOperations(): Promise<Operation[]> {
    return Array.from(this.operations.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async createOperation(insertOp: InsertOperation): Promise<Operation> {
    const id = this.currentId++;
    const operation: Operation = {
      ...insertOp,
      id,
      createdAt: new Date()
    };
    this.operations.set(id, operation);
    return operation;
  }

  async getOperation(id: number): Promise<Operation | undefined> {
    return this.operations.get(id);
  }
}

export const storage = new MemStorage();
