import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { OperationResponse } from '../types/config';
/**
 * Represents the structure of a DynamoDB query condition
 */
export interface QueryCondition {
    /** The condition expression (e.g., "id = :id" or "price > :minPrice") */
    expression: string;
    /** Values for the condition placeholders */
    values: Record<string, any>;
}
/**
 * Comprehensive query parameters that can handle all query scenarios
 */
export interface QueryParams {
    /** Primary key condition (required) */
    keyCondition: {
        expression: string;
        values?: Record<string, any>;
    };
    /** Sort key condition (optional) */
    sortKeyCondition?: QueryCondition;
    /** Index name for GSI/LSI queries (optional) */
    indexName?: string;
    /** Additional filter conditions (optional) */
    filter?: {
        expression: string;
        values?: Record<string, any>;
    };
    /** Attributes to return (optional) */
    select?: string[];
    /** Maximum number of items to return (optional) */
    limit?: number;
    /** Sort direction (optional, default true = ascending) */
    scanIndexForward?: boolean;
    /** Consistent read (optional, default false) */
    consistentRead?: boolean;
    /** Pagination token from previous query (optional) */
    exclusiveStartKey?: Record<string, any>;
}
/**
 * Execute a query operation with automatic handling of reserved words
 */
export declare function queryTable(client: DynamoDBDocumentClient, tableName: string, params: QueryParams): Promise<OperationResponse>;
