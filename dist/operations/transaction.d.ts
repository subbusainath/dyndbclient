import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { OperationResponse } from '../types/config';
/**
 * Types of transaction operations
 */
export declare enum TransactionOperationType {
    Put = "Put",
    Update = "Update",
    Delete = "Delete",
    ConditionCheck = "ConditionCheck"
}
/**
 * Base interface for all transaction operations
 */
export interface TransactionOperation {
    type: TransactionOperationType;
    key: Record<string, any>;
    tableName?: string;
    condition?: string;
    expressionValues?: Record<string, any>;
    expressionNames?: Record<string, string>;
}
/**
 * Put operation in transaction
 */
export interface TransactionPutOperation extends TransactionOperation {
    type: TransactionOperationType.Put;
    item: Record<string, any>;
}
/**
 * Update operation in transaction
 */
export interface TransactionUpdateOperation extends TransactionOperation {
    type: TransactionOperationType.Update;
    updateExpression: string;
}
/**
 * Delete operation in transaction
 */
export interface TransactionDeleteOperation extends TransactionOperation {
    type: TransactionOperationType.Delete;
}
/**
 * Condition check in transaction
 */
export interface TransactionConditionCheck extends TransactionOperation {
    type: TransactionOperationType.ConditionCheck;
    conditionExpression: string;
}
export type TransactionItem = TransactionPutOperation | TransactionUpdateOperation | TransactionDeleteOperation | TransactionConditionCheck;
/**
 * Execute a transaction write with multiple operations
 */
export declare function executeTransaction(client: DynamoDBDocumentClient, defaultTableName: string, operations: TransactionItem[]): Promise<OperationResponse>;
/**
 * Execute a transaction get for multiple items
 */
export declare function transactionGet(client: DynamoDBDocumentClient, defaultTableName: string, items: {
    key: Record<string, any>;
    tableName?: string;
}[]): Promise<OperationResponse>;
