import { DyndbClient } from './core/client';
import { DynamoDBAttributeType, AttributePatterns } from './core/attributes/dynamodb-types';
import { ScanBuilder } from './operations/scan-builder';
import { StreamRecord, StreamHandler, StreamOptions, StreamProcessingConfig, StreamIteratorType } from './operations/stream';
import type { ClientConfig, TableAttributes, QueryParams, UpdateOptions, CreateOptions, ReadOptions, DeleteOptions, ScanOptions, OperationResponse, BatchGetOptions, BatchWriteOptions, PutOptions, ConsumedCapacity } from './types';
export { DyndbClient, DynamoDBAttributeType, AttributePatterns, ScanBuilder, StreamRecord, StreamHandler, StreamOptions, StreamProcessingConfig, StreamIteratorType };
export type { ClientConfig, TableAttributes, QueryParams, UpdateOptions, CreateOptions, ReadOptions, DeleteOptions, ScanOptions, OperationResponse, BatchGetOptions, BatchWriteOptions, PutOptions, ConsumedCapacity };
