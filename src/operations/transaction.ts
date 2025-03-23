import {
  DynamoDBDocumentClient,
  TransactWriteCommand,
  TransactGetCommand,
  TransactWriteCommandInput,
  TransactGetCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { OperationResponse } from '../types/config';
import { handleError } from '../core/error-handler';

/**
 * Types of transaction operations
 */
export enum TransactionOperationType {
  Put = 'Put',
  Update = 'Update',
  Delete = 'Delete',
  ConditionCheck = 'ConditionCheck',
}

/**
 * Base interface for all transaction operations
 */
export interface TransactionOperation {
  type: TransactionOperationType;
  key: Record<string, any>;
  tableName?: string;
  condition?: string;
  expressionValues?: Record<string, any>;
  expressionNames?: Record<string, string>;
}

/**
 * Put operation in transaction
 */
export interface TransactionPutOperation extends TransactionOperation {
  type: TransactionOperationType.Put;
  item: Record<string, any>;
}

/**
 * Update operation in transaction
 */
export interface TransactionUpdateOperation extends TransactionOperation {
  type: TransactionOperationType.Update;
  updateExpression: string;
}

/**
 * Delete operation in transaction
 */
export interface TransactionDeleteOperation extends TransactionOperation {
  type: TransactionOperationType.Delete;
}

/**
 * Condition check in transaction
 */
export interface TransactionConditionCheck extends TransactionOperation {
  type: TransactionOperationType.ConditionCheck;
  conditionExpression: string;
}

export type TransactionItem =
  | TransactionPutOperation
  | TransactionUpdateOperation
  | TransactionDeleteOperation
  | TransactionConditionCheck;

/**
 * Execute a transaction write with multiple operations
 */
export async function executeTransaction(
  client: DynamoDBDocumentClient,
  defaultTableName: string,
  operations: TransactionItem[]
): Promise<OperationResponse> {
  try {
    const transactItems = operations.map(operation => {
      const tableName = operation.tableName || defaultTableName;
      let transactItem;

      // Handle each operation type separately with proper type casting
      if (operation.type === TransactionOperationType.Put) {
        const putOp = operation as TransactionPutOperation;
        transactItem = {
          Put: {
            TableName: tableName,
            Item: putOp.item,
            ConditionExpression: putOp.condition,
            ExpressionAttributeValues: putOp.expressionValues,
          },
        };
      } else if (operation.type === TransactionOperationType.Update) {
        const updateOp = operation as TransactionUpdateOperation;
        transactItem = {
          Update: {
            TableName: tableName,
            Key: updateOp.key,
            UpdateExpression: updateOp.updateExpression,
            ConditionExpression: updateOp.condition,
            ExpressionAttributeValues: updateOp.expressionValues,
            ExpressionAttributeNames: updateOp.expressionNames,
          },
        };
      } else if (operation.type === TransactionOperationType.Delete) {
        const deleteOp = operation as TransactionDeleteOperation;
        transactItem = {
          Delete: {
            TableName: tableName,
            Key: deleteOp.key,
            ConditionExpression: deleteOp.condition,
            ExpressionAttributeValues: deleteOp.expressionValues,
          },
        };
      } else if (operation.type === TransactionOperationType.ConditionCheck) {
        const conditionOp = operation as TransactionConditionCheck;
        transactItem = {
          ConditionCheck: {
            TableName: tableName,
            Key: conditionOp.key,
            ConditionExpression: conditionOp.conditionExpression,
            ExpressionAttributeValues: conditionOp.expressionValues,
          },
        };
      } else {
        throw new Error(`Unsupported transaction operation type`);
      }

      return transactItem;
    });

    const input: TransactWriteCommandInput = {
      TransactItems: transactItems,
    };

    await client.send(new TransactWriteCommand(input));

    return {
      success: true,
      data: {
        // DynamoDB transactions don't return a transactionId
        // Use a placeholder value for the response
        transactionStatus: 'Executed',
        operationsCount: operations.length,
      },
    };
  } catch (error) {
    return handleError('Transaction execution failed', error);
  }
}

/**
 * Execute a transaction get for multiple items
 */
export async function transactionGet(
  client: DynamoDBDocumentClient,
  defaultTableName: string,
  items: { key: Record<string, any>; tableName?: string }[]
): Promise<OperationResponse> {
  try {
    const transactItems = items.map(item => ({
      Get: {
        TableName: item.tableName || defaultTableName,
        Key: item.key,
      },
    }));

    const input: TransactGetCommandInput = {
      TransactItems: transactItems,
    };

    const result = await client.send(new TransactGetCommand(input));

    return {
      success: true,
      data: {
        items: result.Responses?.map(response => response.Item),
      },
    };
  } catch (error) {
    return handleError('Transaction get failed', error);
  }
}
