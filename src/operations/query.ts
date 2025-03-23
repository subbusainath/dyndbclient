import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { ExpressionAttributeHandler } from '../core/reserved-words';
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
export async function queryTable(
  client: DynamoDBDocumentClient,
  tableName: string,
  params: QueryParams
): Promise<OperationResponse> {
  try {
    const expressionHandler = new ExpressionAttributeHandler();

    // Process key condition expression
    const { keyConditionExpression, expressionAttributeNames: keyConditionNames } =
      expressionHandler.processKeyConditionExpression(params.keyCondition.expression);

    // Process projection expression if select is specified
    let projectionExpression: string | undefined;
    let projectionNames: Record<string, string> | undefined;

    if (params.select && params.select.length > 0) {
      const result = expressionHandler.processProjectionExpression(params.select);
      projectionExpression = result.projectionExpression;
      projectionNames = result.expressionAttributeNames;
    }

    // Process filter expression if specified
    let filterExpression: string | undefined;
    let filterNames: Record<string, string> | undefined;

    if (params.filter) {
      const result = expressionHandler.processKeyConditionExpression(params.filter.expression);
      filterExpression = result.keyConditionExpression;
      filterNames = result.expressionAttributeNames;
    }

    // Combine all expression attribute names
    const expressionAttributeNames = {
      ...keyConditionNames,
      ...projectionNames,
      ...filterNames,
    };

    const command = new QueryCommand({
      TableName: tableName,
      IndexName: params.indexName,
      KeyConditionExpression: keyConditionExpression,
      FilterExpression: filterExpression,
      ProjectionExpression: projectionExpression,
      ExpressionAttributeNames:
        Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues:
        params.keyCondition.values || params.filter?.values
          ? {
              ...(params.keyCondition.values || {}),
              ...(params.filter?.values || {}),
            }
          : undefined,
      Limit: params.limit,
      ScanIndexForward: params.scanIndexForward,
      ConsistentRead: params.consistentRead,
      ExclusiveStartKey: params.exclusiveStartKey,
    });

    const response = await client.send(command);

    return {
      success: true,
      data: response.Items || [],
      lastEvaluatedKey: response.LastEvaluatedKey,
      count: response.Count,
      scannedCount: response.ScannedCount,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error during query operation'),
    };
  }
}
