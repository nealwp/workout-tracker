import type { Storage } from "./types";
import { findOrCreateUser, getUserById, getUserByGoogleId } from "./memory/users";
import {
  createWorkout,
  getWorkout,
  listWorkouts,
  saveWorkout,
  deleteWorkout,
} from "./memory/workouts";
import { storeRefreshToken, getRefreshToken, deleteRefreshToken } from "./memory/refresh-tokens";
import * as dynamodbUsers from "./dynamodb/users";
import * as dynamodbWorkouts from "./dynamodb/workouts";
import * as dynamodbRefreshTokens from "./dynamodb/refresh-tokens";

function memoryStorage(): Storage {
  return {
    findOrCreateUser,
    getUserById,
    getUserByGoogleId,
    createWorkout,
    getWorkout,
    listWorkouts,
    saveWorkout,
    deleteWorkout,
    storeRefreshToken,
    getRefreshToken,
    deleteRefreshToken,
  };
}

function dynamoDbStorage(): Storage {
  return {
    findOrCreateUser: dynamodbUsers.findOrCreateUser,
    getUserById: dynamodbUsers.getUserById,
    getUserByGoogleId: dynamodbUsers.getUserByGoogleId,
    createWorkout: dynamodbWorkouts.createWorkout,
    getWorkout: dynamodbWorkouts.getWorkout,
    listWorkouts: dynamodbWorkouts.listWorkouts,
    saveWorkout: dynamodbWorkouts.saveWorkout,
    deleteWorkout: dynamodbWorkouts.deleteWorkout,
    storeRefreshToken: dynamodbRefreshTokens.storeRefreshToken,
    getRefreshToken: dynamodbRefreshTokens.getRefreshToken,
    deleteRefreshToken: dynamodbRefreshTokens.deleteRefreshToken,
  };
}

export function getStorage(): Storage {
  if (process.env.STORAGE === "memory") {
    return memoryStorage();
  }
  if (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.STORAGE === "dynamodb") {
    return dynamoDbStorage();
  }
  return memoryStorage();
}

export function isMemoryStorage(): boolean {
  if (process.env.STORAGE === "memory") return true;
  if (process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.STORAGE === "dynamodb") return false;
  return true;
}

export type { Storage } from "./types";
