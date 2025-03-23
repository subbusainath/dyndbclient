import { DynamoDBDocumentClient, DeleteCommand, DeleteCommandInput } from '@aws-sdk/lib-dynamodb';
import { OperationResponse } from '../types/config';
import { handleError } from '../core/error-handler';

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
export async function deleteItem(
  client: DynamoDBDocumentClient,
  tableName: string,
  key: Record<string, any>,
  options: DeleteOptions = {}
): Promise<OperationResponse> {
  try {
    const input: DeleteCommandInput = {
      TableName: tableName,
      Key: key,
      ConditionExpression: options.condition,
      ExpressionAttributeValues: options.expressionValues,
      ExpressionAttributeNames: options.expressionNames,
      ReturnValues: options.returnValues,
    };

    const result = await client.send(new DeleteCommand(input));

    return {
      success: true,
      data: result.Attributes || null,
    };
  } catch (error) {
    return handleError('Failed to delete item', error);
  }
}
