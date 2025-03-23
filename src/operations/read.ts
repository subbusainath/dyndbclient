import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { ExpressionAttributeHandler } from '../core/reserved-words';
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
export async function readItem(
  client: DynamoDBDocumentClient,
  tableName: string,
  key: Record<string, any>,
  options?: ReadOptions
): Promise<OperationResponse> {
  try {
    const expressionHandler = new ExpressionAttributeHandler();

    // Process projection expression if select is specified
    let projectionExpression: string | undefined;
    let expressionAttributeNames: Record<string, string> | undefined;

    if (options?.select && options.select.length > 0) {
      const result = expressionHandler.processProjectionExpression(options.select);
      projectionExpression = result.projectionExpression;
      expressionAttributeNames = result.expressionAttributeNames;
    }

    const command = new GetCommand({
      TableName: tableName,
      Key: key,
      ProjectionExpression: projectionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ConsistentRead: options?.consistentRead,
    });

    const response = await client.send(command);

    return {
      success: true,
      data: response.Item || null,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error during read operation'),
    };
  }
}
