import {
  executeTransaction,
  TransactionOperation,
  TransactionOperationType,
} from '../../operations/transaction';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';

jest.mock('@aws-sdk/lib-dynamodb');

describe('Transaction Operations', () => {
  let mockDynamoClient: jest.Mocked<DynamoDBDocumentClient>;

  beforeEach(() => {
    mockDynamoClient = {
      send: jest.fn().mockResolvedValue({}),
    } as unknown as jest.Mocked<DynamoDBDocumentClient>;

    (TransactWriteCommand as jest.Mock).mockClear();
  });

  describe('executeTransaction', () => {
    it('should execute transaction with PUT operation', async () => {
      const operations: TransactionOperation[] = [
        {
          type: TransactionOperationType.PUT,
          tableName: 'Users',
          item: { userId: 'user1', name: 'John Doe' },
        },
      ];

      await executeTransaction(mockDynamoClient, operations);

      expect(TransactWriteCommand).toHaveBeenCalledWith({
        TransactItems: [
          {
            Put: {
              TableName: 'Users',
              Item: { userId: 'user1', name: 'John Doe' },
            },
          },
        ],
      });
      expect(mockDynamoClient.send).toHaveBeenCalled();
    });

    it('should execute transaction with DELETE operation', async () => {
      const operations: TransactionOperation[] = [
        {
          type: TransactionOperationType.DELETE,
          tableName: 'Users',
          key: { userId: 'user1' },
        },
      ];

      await executeTransaction(mockDynamoClient, operations);

      expect(TransactWriteCommand).toHaveBeenCalledWith({
        TransactItems: [
          {
            Delete: {
              TableName: 'Users',
              Key: { userId: 'user1' },
            },
          },
        ],
      });
      expect(mockDynamoClient.send).toHaveBeenCalled();
    });

    it('should execute transaction with UPDATE operation using expression names', async () => {
      const operations: TransactionOperation[] = [
        {
          type: TransactionOperationType.UPDATE,
          tableName: 'Users',
          key: { userId: 'user1' },
          updateExpression: 'SET #name = :name',
          expressionValues: { ':name': 'Jane Doe' },
          expressionNames: { '#name': 'name' },
        },
      ];

      await executeTransaction(mockDynamoClient, operations);

      expect(TransactWriteCommand).toHaveBeenCalledWith({
        TransactItems: [
          {
            Update: {
              TableName: 'Users',
              Key: { userId: 'user1' },
              UpdateExpression: 'SET #name = :name',
              ExpressionAttributeValues: { ':name': 'Jane Doe' },
              ExpressionAttributeNames: { '#name': 'name' },
            },
          },
        ],
      });
      expect(mockDynamoClient.send).toHaveBeenCalled();
    });

    it('should execute transaction with CONDITION_CHECK operation', async () => {
      const operations: TransactionOperation[] = [
        {
          type: TransactionOperationType.CONDITION_CHECK,
          tableName: 'Users',
          key: { userId: 'user1' },
          conditionExpression: 'attribute_exists(userId)',
        },
      ];

      await executeTransaction(mockDynamoClient, operations);

      expect(TransactWriteCommand).toHaveBeenCalledWith({
        TransactItems: [
          {
            ConditionCheck: {
              TableName: 'Users',
              Key: { userId: 'user1' },
              ConditionExpression: 'attribute_exists(userId)',
            },
          },
        ],
      });
      expect(mockDynamoClient.send).toHaveBeenCalled();
    });

    it('should execute transaction with condition check using expression names', async () => {
      const operations: TransactionOperation[] = [
        {
          type: TransactionOperationType.CONDITION_CHECK,
          tableName: 'Users',
          key: { userId: 'user1' },
          conditionExpression: 'attribute_exists(#id)',
          expressionNames: { '#id': 'userId' },
        },
      ];

      await executeTransaction(mockDynamoClient, operations);

      expect(TransactWriteCommand).toHaveBeenCalledWith({
        TransactItems: [
          {
            ConditionCheck: {
              TableName: 'Users',
              Key: { userId: 'user1' },
              ConditionExpression: 'attribute_exists(#id)',
              ExpressionAttributeNames: { '#id': 'userId' },
            },
          },
        ],
      });
      expect(mockDynamoClient.send).toHaveBeenCalled();
    });

    it('should execute multiple operations in a single transaction', async () => {
      const operations: TransactionOperation[] = [
        {
          type: TransactionOperationType.PUT,
          tableName: 'Users',
          item: { userId: 'user1', name: 'John Doe' },
        },
        {
          type: TransactionOperationType.UPDATE,
          tableName: 'Stats',
          key: { statId: 'users' },
          updateExpression: 'SET #count = #count + :val',
          expressionValues: { ':val': 1 },
          expressionNames: { '#count': 'count' },
        },
      ];

      await executeTransaction(mockDynamoClient, operations);

      expect(TransactWriteCommand).toHaveBeenCalledWith({
        TransactItems: [
          {
            Put: {
              TableName: 'Users',
              Item: { userId: 'user1', name: 'John Doe' },
            },
          },
          {
            Update: {
              TableName: 'Stats',
              Key: { statId: 'users' },
              UpdateExpression: 'SET #count = #count + :val',
              ExpressionAttributeValues: { ':val': 1 },
              ExpressionAttributeNames: { '#count': 'count' },
            },
          },
        ],
      });
      expect(mockDynamoClient.send).toHaveBeenCalled();
    });
  });
});
