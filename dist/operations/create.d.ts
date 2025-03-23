import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { OperationResponse, CreateOptions } from '../types';
/**
 * Create a new item in DynamoDB
 */
export declare function createItem(client: DynamoDBDocumentClient, tableName: string, item: Record<string, any>, options?: CreateOptions): Promise<OperationResponse>;
export { CreateOptions };
