import { DynamoDBDocumentClient, ScanCommand, ScanCommandInput } from '@aws-sdk/lib-dynamodb';
import { OperationResponse } from '../types/config';
import { handleError } from '../core/error-handler';

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
export async function scanTable(
  client: DynamoDBDocumentClient,
  tableName: string,
  options: ScanOptions = {}
): Promise<OperationResponse> {
  try {
    const input: ScanCommandInput = {
      TableName: tableName,
      FilterExpression: options.filter,
      ExpressionAttributeValues: options.expressionValues,
      ExpressionAttributeNames: options.expressionNames,
      ProjectionExpression: options.attributes?.join(', '),
      Limit: options.limit,
      ExclusiveStartKey: options.startKey,
      IndexName: options.indexName,
      ConsistentRead: options.consistent,
      TotalSegments: options.totalSegments,
      Segment: options.segment,
    };

    const result = await client.send(new ScanCommand(input));

    return {
      success: true,
      data: {
        items: result.Items || [],
        count: result.Count,
        scannedCount: result.ScannedCount,
        nextToken: result.LastEvaluatedKey,
      },
    };
  } catch (error) {
    return handleError('Failed to scan table', error);
  }
}
