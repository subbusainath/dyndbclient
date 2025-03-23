import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { OperationResponse, ConsumedCapacityResponse, CreateOptions } from '../types';

/**
 * Create a new item in DynamoDB
 */
export async function createItem(
  client: DynamoDBDocumentClient,
  tableName: string,
  item: Record<string, any>,
  options: CreateOptions = {}
): Promise<OperationResponse> {
  try {
    const command = new PutCommand({
      TableName: tableName,
      Item: item,
      ConditionExpression: options.conditionExpression,
      ExpressionAttributeNames: options.expressionAttributeNames,
      ExpressionAttributeValues: options.expressionAttributeValues,
      ReturnValues: options.returnValues,
      ReturnConsumedCapacity: options.returnConsumedCapacity,
      ReturnItemCollectionMetrics: options.returnItemCollectionMetrics,
    });

    const response = await client.send(command);

    return {
      success: true,
      data: response.Attributes,
      consumedCapacity: response.ConsumedCapacity as ConsumedCapacityResponse,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error during create operation'),
    };
  }
}

export { CreateOptions };
