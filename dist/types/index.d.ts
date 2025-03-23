/**
 * Core types for the DynamoDB client wrapper
 */
import { AttributeError } from '../core/attributes/types';
import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
/**
 * Client configuration
 */
export interface ClientConfig {
    /** AWS region for the DynamoDB table (required) */
    region: string;
    /** Table name to operate on (required) */
    tableName: string;
    /** Optional DynamoDB endpoint (useful for local development) */
    endpoint?: string;
    /**
     * Optional AWS SDK client options
     * If not provided, the SDK will use the default credential chain (environment variables,
     * shared credentials file ~/.aws/credentials, or EC2/ECS instance credentials)
     */
    clientOptions?: DynamoDBClientConfig;
    /** Maximum number of retries for failed operations */
    maxRetries?: number;
    /** Timeout in ms for requests */
    timeout?: number;
    /** Whether to use consistent reads by default */
    consistentRead?: boolean;
}
/**
 * Operation response type
 */
export interface OperationResponse {
    success: boolean;
    data?: any;
    error?: Error;
    consumedCapacity?: ConsumedCapacityResponse;
}
/**
 * Operation result type
 */
export interface OperationResult {
    success: boolean;
    errors?: AttributeError[];
}
/**
 * Table attributes type
 */
export interface TableAttributes {
    tableName: string;
    attributes: Record<string, any>;
}
/**
 * DynamoDB specific types
 */
export interface ConsumedCapacity {
    tableName: string;
    capacityUnits: number;
    readCapacityUnits?: number;
    writeCapacityUnits?: number;
}
export type ConsumedCapacityResponse = ConsumedCapacity | ConsumedCapacity[];
export interface BatchGetOptions {
    consistentRead?: boolean;
    returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE';
}
export interface BatchWriteOptions {
    returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE';
    returnItemCollectionMetrics?: 'SIZE' | 'NONE';
}
export interface QueryOptions {
    consistentRead?: boolean;
    scanIndexForward?: boolean;
    limit?: number;
    returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE';
    select?: 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES' | 'COUNT';
    projectionExpression?: string;
    filterExpression?: string;
    expressionAttributeNames?: Record<string, string>;
    expressionAttributeValues?: Record<string, any>;
    exclusiveStartKey?: Record<string, any>;
}
export interface ScanOptions {
    limit?: number;
    returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE';
    select?: 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES' | 'COUNT';
    projectionExpression?: string;
    filterExpression?: string;
    expressionAttributeNames?: Record<string, string>;
    expressionAttributeValues?: Record<string, any>;
    exclusiveStartKey?: Record<string, any>;
    segment?: number;
    totalSegments?: number;
}
export interface UpdateOptions {
    conditionExpression?: string;
    expressionAttributeNames?: Record<string, string>;
    expressionAttributeValues?: Record<string, any>;
    returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE';
    returnItemCollectionMetrics?: 'SIZE' | 'NONE';
    returnValues?: 'ALL_NEW' | 'ALL_OLD' | 'UPDATED_NEW' | 'UPDATED_OLD' | 'NONE';
}
export interface DeleteOptions {
    conditionExpression?: string;
    expressionAttributeNames?: Record<string, string>;
    expressionAttributeValues?: Record<string, any>;
    returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE';
    returnItemCollectionMetrics?: 'SIZE' | 'NONE';
    returnValues?: 'ALL_NEW' | 'ALL_OLD' | 'UPDATED_NEW' | 'UPDATED_OLD' | 'NONE';
}
export interface PutOptions {
    conditionExpression?: string;
    expressionAttributeNames?: Record<string, string>;
    expressionAttributeValues?: Record<string, any>;
    returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE';
    returnItemCollectionMetrics?: 'SIZE' | 'NONE';
    returnValues?: 'ALL_NEW' | 'ALL_OLD' | 'UPDATED_NEW' | 'UPDATED_OLD' | 'NONE';
}
/**
 * Type conversion utilities
 */
export declare namespace TypeConversion {
    function toDynamoDBAttribute(attr: any): any;
    function toDynamoDBValue(value: any): any;
    function fromDynamoDBValue(dynamoValue: any): any;
}
/**
 * Query parameters for table queries
 */
export interface QueryParams {
    indexName?: string;
    keyCondition: {
        expression: string;
        values: Record<string, any>;
    };
    filter?: {
        expression: string;
        values: Record<string, any>;
    };
    select?: string[];
    limit?: number;
    scanIndexForward?: boolean;
    exclusiveStartKey?: Record<string, any>;
}
/**
 * Options for create operations
 */
export interface CreateOptions extends PutOptions {
}
/**
 * Options for read operations
 */
export interface ReadOptions {
    consistentRead?: boolean;
    returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE';
    projectionExpression?: string;
    expressionAttributeNames?: Record<string, string>;
}
export declare enum UpdateOperationType {
    SET = "SET",
    REMOVE = "REMOVE",
    ADD = "ADD",
    DELETE = "DELETE"
}
export declare enum QueryOperationType {
    EQUALS = "EQUALS",
    NOT_EQUALS = "NOT_EQUALS",
    GREATER_THAN = "GREATER_THAN",
    LESS_THAN = "LESS_THAN",
    CONTAINS = "CONTAINS",
    BEGINS_WITH = "BEGINS_WITH",
    IN = "IN",
    BETWEEN = "BETWEEN"
}
export interface FieldUpdate {
    field: string;
    value?: any;
    operation: UpdateOperationType;
}
export interface QueryCondition {
    field: string;
    value: any;
    operation: QueryOperationType;
}
