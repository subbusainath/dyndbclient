import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ExpressionAttributeHandler } from '../core/reserved-words';
import { OperationResponse } from '../types/config';

export enum UpdateOperationType {
  SET = 'SET',
  REMOVE = 'REMOVE',
  ADD = 'ADD',
  DELETE = 'DELETE',
}

export interface FieldUpdate {
  field: string;
  value?: any;
  operation: UpdateOperationType;
}

export interface UpdateOptions {
  condition?: {
    expression: string;
    values?: Record<string, any>;
  };
  returnValues?: 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW';
}

/**
 * Builder class for constructing complex update expressions
 */
export class UpdateBuilder {
  private updates: FieldUpdate[] = [];

  constructor() {}

  /**
   * Set a field value
   */
  set(field: string, value: any): UpdateBuilder {
    this.updates.push({
      field,
      value,
      operation: UpdateOperationType.SET,
    });
    return this;
  }

  /**
   * Remove a field
   */
  remove(field: string): UpdateBuilder {
    this.updates.push({
      field,
      operation: UpdateOperationType.REMOVE,
    });
    return this;
  }

  /**
   * Add a value to a number field or add elements to a set
   */
  add(field: string, value: any): UpdateBuilder {
    this.updates.push({
      field,
      value,
      operation: UpdateOperationType.ADD,
    });
    return this;
  }

  /**
   * Delete elements from a set
   */
  delete(field: string, value: any): UpdateBuilder {
    this.updates.push({
      field,
      value,
      operation: UpdateOperationType.DELETE,
    });
    return this;
  }

  /**
   * Increment a number field by 1
   */
  increment(field: string): UpdateBuilder {
    return this.add(field, 1);
  }

  /**
   * Decrement a number field by 1
   */
  decrement(field: string): UpdateBuilder {
    return this.add(field, -1);
  }

  /**
   * Append items to a list
   */
  appendToList(field: string, items: any[]): UpdateBuilder {
    return this.set(field, `list_append(if_not_exists(${field}, :empty_list), :items)`)
      .set(':empty_list', [])
      .set(':items', items);
  }

  /**
   * Get all updates
   */
  getUpdates(): FieldUpdate[] {
    return this.updates;
  }
}

/**
 * Update an item in DynamoDB
 */
export async function updateItem(
  client: DynamoDBDocumentClient,
  tableName: string,
  key: Record<string, any>,
  updates: FieldUpdate[] | UpdateBuilder,
  options: UpdateOptions = {}
): Promise<OperationResponse> {
  try {
    const expressionHandler = new ExpressionAttributeHandler();
    const updateArray = updates instanceof UpdateBuilder ? updates.getUpdates() : updates;

    // Group updates by operation type
    const groupedUpdates = updateArray.reduce(
      (acc, update) => {
        if (!acc[update.operation]) {
          acc[update.operation] = [];
        }
        acc[update.operation].push(update);
        return acc;
      },
      {} as Record<UpdateOperationType, FieldUpdate[]>
    );

    // Build update expression parts
    const expressionParts: string[] = [];
    const expressionValues: Record<string, any> = {};
    let valueCounter = 0;

    Object.entries(groupedUpdates).forEach(([operation, updates]) => {
      if (updates.length === 0) return;

      const updateParts = updates.map(update => {
        const fieldName = expressionHandler.getExpressionAttributeName(update.field);
        if (update.value !== undefined) {
          const placeholder = `:val${++valueCounter}`;

          // Handle special list append/prepend operations
          if (
            update.operation === UpdateOperationType.SET &&
            typeof update.value === 'object' &&
            update.value !== null
          ) {
            // List append operation
            if (update.value.__listAppend) {
              const itemsPlaceholder = `:items${valueCounter}`;
              const emptyListPlaceholder = `:empty${valueCounter}`;
              expressionValues[itemsPlaceholder] = update.value.items;
              expressionValues[emptyListPlaceholder] = [];
              return `${fieldName} = list_append(if_not_exists(${fieldName}, ${emptyListPlaceholder}), ${itemsPlaceholder})`;
            }

            // List prepend operation
            if (update.value.__listPrepend) {
              const itemsPlaceholder = `:items${valueCounter}`;
              const emptyListPlaceholder = `:empty${valueCounter}`;
              expressionValues[itemsPlaceholder] = update.value.items;
              expressionValues[emptyListPlaceholder] = [];
              return `${fieldName} = list_append(${itemsPlaceholder}, if_not_exists(${fieldName}, ${emptyListPlaceholder}))`;
            }
          }

          // Default handling for normal values
          expressionValues[placeholder] = update.value;

          // Different format based on operation type
          if (operation === UpdateOperationType.SET) {
            return `${fieldName} = ${placeholder}`;
          } else if (
            operation === UpdateOperationType.ADD ||
            operation === UpdateOperationType.DELETE
          ) {
            return `${fieldName} ${placeholder}`;
          } else {
            return fieldName;
          }
        }
        return fieldName;
      });

      expressionParts.push(`${operation} ${updateParts.join(', ')}`);
    });

    // Add condition values if present
    if (options.condition?.values) {
      Object.entries(options.condition.values).forEach(([key, value]) => {
        expressionValues[key] = value;
      });
    }

    const command = new UpdateCommand({
      TableName: tableName,
      Key: key,
      UpdateExpression: expressionParts.join(' '),
      ExpressionAttributeNames: expressionHandler.getExpressionAttributeNames(),
      ExpressionAttributeValues:
        Object.keys(expressionValues).length > 0 ? expressionValues : undefined,
      ConditionExpression: options.condition?.expression,
      ReturnValues: options.returnValues,
    });

    const response = await client.send(command);

    return {
      success: true,
      data: response.Attributes,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error during update operation'),
    };
  }
}
