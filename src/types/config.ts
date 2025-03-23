import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { ConsumedCapacityResponse } from './index';

/**
 * Configuration interface for the DynamoDB wrapper
 */
export interface ClientConfig {
  /** AWS region for the DynamoDB table */
  region: string;

  /** Table name to operate on */
  tableName: string;

  /** Optional DynamoDB endpoint (useful for local development) */
  endpoint?: string;

  /** Additional AWS SDK client options */
  clientOptions?: Partial<DynamoDBClientConfig>;
}

/**
 * Common response interface for all operations
 */
export interface OperationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: Error;
  consumedCapacity?: ConsumedCapacityResponse;
  lastEvaluatedKey?: Record<string, any>;
  count?: number;
  scannedCount?: number;
}
