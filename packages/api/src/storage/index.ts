import type { Storage } from "./types";
import { MemoryStorage } from "./memory";
import { DynamoDBStorage } from "./dynamodb";

export function getStorage(): Storage {
  if (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.STORAGE === "dynamodb") {
    return new DynamoDBStorage();
  }
  return new MemoryStorage();
}

export type { Storage } from "./types";