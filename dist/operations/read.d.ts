import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { OperationResponse } from '../types/config';
/**
 * Options for read operation
 */
export interface ReadOptions {
    select?: string[];
    consistentRead?: boolean;
}
/**
 * Read an item from DynamoDB with automatic handling of reserved words
 */
export declare function readItem(client: DynamoDBDocumentClient, tableName: string, key: Record<string, any>, options?: ReadOptions): Promise<OperationResponse>;
