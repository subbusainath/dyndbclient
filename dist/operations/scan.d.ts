import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { OperationResponse } from '../types/config';
/**
 * Options for scan operation
 */
export interface ScanOptions {
    /** Filter expression */
    filter?: string;
    /** Expression values */
    expressionValues?: Record<string, any>;
    /** Expression names */
    expressionNames?: Record<string, string>;
    /** Attributes to retrieve */
    attributes?: string[];
    /** Maximum items to return */
    limit?: number;
    /** Exclusive start key for pagination */
    startKey?: Record<string, any>;
    /** Index to scan */
    indexName?: string;
    /** Consistent read */
    consistent?: boolean;
    /** Total segments for parallel scan */
    totalSegments?: number;
    /** Current segment for parallel scan */
    segment?: number;
}
/**
 * Scan table with options
 */
export declare function scanTable(client: DynamoDBDocumentClient, tableName: string, options?: ScanOptions): Promise<OperationResponse>;
