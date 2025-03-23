import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { OperationResponse } from '../types/config';
/**
 * Options for delete operation
 */
export interface DeleteOptions {
    /** Condition for delete */
    condition?: string;
    /** Expression values */
    expressionValues?: Record<string, any>;
    /** Expression names */
    expressionNames?: Record<string, string>;
    /** Return values */
    returnValues?: 'ALL_OLD' | 'NONE';
}
/**
 * Delete an item by key
 */
export declare function deleteItem(client: DynamoDBDocumentClient, tableName: string, key: Record<string, any>, options?: DeleteOptions): Promise<OperationResponse>;
