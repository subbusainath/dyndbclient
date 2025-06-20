/**
 * DyndbClient - A simplified and type-safe wrapper around AWS DynamoDB client
 *
 * This library provides a user-friendly interface to interact with AWS DynamoDB,
 * supporting both JavaScript and TypeScript projects.
 *
 * @packageDocumentation
 */

// Main entry point for the DynamoDB Client wrapper
import { DyndbClient } from './core/client';
import { DynamoDBAttributeType, AttributePatterns } from './core/attributes/dynamodb-types';
import { ScanBuilder } from './operations/scan-builder';
import { ClientBuilder } from './core/client-builder';
import {
  StreamRecord,
  StreamHandler,
  StreamOptions,
  StreamProcessingConfig,
  StreamIteratorType,
} from './operations/stream';
import type {
  ClientConfig,
  TableAttributes,
  QueryParams,
  UpdateOptions,
  CreateOptions,
  ReadOptions,
  DeleteOptions,
  ScanOptions,
  OperationResponse,
  BatchGetOptions,
  BatchWriteOptions,
  PutOptions,
  ConsumedCapacity,
} from './types';

/**
 * Export the main client class and utility classes
 */
export {
  ClientBuilder,
  DyndbClient,
  DynamoDBAttributeType,
  AttributePatterns,
  ScanBuilder,
  StreamRecord,
  StreamHandler,
  StreamOptions,
  StreamProcessingConfig,
  StreamIteratorType,
};

/**
 * Export types needed for client configuration and operations
 *
 * These are accessible in TypeScript projects for type safety
 * but are ignored in JavaScript projects.
 */
export type {
  ClientConfig,
  TableAttributes,
  QueryParams,
  UpdateOptions,
  CreateOptions,
  ReadOptions,
  DeleteOptions,
  ScanOptions,
  OperationResponse,
  BatchGetOptions,
  BatchWriteOptions,
  PutOptions,
  ConsumedCapacity,
};
