import { ClientBuilder } from '../src/core/client-builder';
import { UpdateBuilder } from '../src/operations/update-builder';
import { QueryBuilder } from '../src/operations/query-builder';
import { UpdateOperationType, QueryOperationType } from '../src/types';

describe('Builder Usage Tests', () => {
  describe('ClientBuilder Usage', () => {
    it('should create a valid client configuration', () => {
      const client = new ClientBuilder()
        .withRegion('us-east-1')
        .withTableName('test-table')
        .withEndpoint('http://localhost:8000')
        .withConsistentRead(false)
        .withClientOptions({
          credentials: {
            accessKeyId: 'local',
            secretAccessKey: 'local',
          },
        })
        .build();

      // Just verify that the build() method returns an object
      expect(client).toBeDefined();
    });
  });

  describe('UpdateBuilder Usage', () => {
    it('should build a valid update operation', () => {
      const updates = new UpdateBuilder()
        .set('name', 'John Doe')
        .increment('age', 1)
        .appendToList('interests', 'gaming')
        .build();

      expect(updates).toHaveLength(3);
      expect(updates[0]).toEqual({
        field: 'name',
        value: 'John Doe',
        operation: UpdateOperationType.SET,
      });
      expect(updates[1]).toEqual({
        field: 'age',
        value: 1,
        operation: UpdateOperationType.ADD,
      });
      expect(updates[2]).toEqual({
        field: 'interests',
        value: {
          __listAppend: true,
          items: ['gaming'],
        },
        operation: UpdateOperationType.SET,
      });
    });

    it('should handle complex update operations', () => {
      const updates = new UpdateBuilder()
        .set('status', 'active')
        .increment('loginCount', 1)
        .remove('tempData')
        .addToSet('roles', 'admin')
        .removeFromSet('roles', 'guest')
        .build();

      expect(updates).toHaveLength(5);
      expect(updates).toEqual([
        {
          field: 'status',
          value: 'active',
          operation: UpdateOperationType.SET,
        },
        {
          field: 'loginCount',
          value: 1,
          operation: UpdateOperationType.ADD,
        },
        {
          field: 'tempData',
          operation: UpdateOperationType.REMOVE,
        },
        {
          field: 'roles',
          value: 'admin',
          operation: UpdateOperationType.ADD,
        },
        {
          field: 'roles',
          value: 'guest',
          operation: UpdateOperationType.DELETE,
        },
      ]);
    });
  });

  describe('QueryBuilder Usage', () => {
    it('should build a valid query operation', () => {
      const query = new QueryBuilder()
        .usingIndex('email_index')
        .equals('email', 'john@example.com')
        .greaterThan('age', 18)
        .withLimit(10)
        .selectFields(['userId', 'name', 'email'])
        .build();

      expect(query).toEqual({
        conditions: [
          {
            field: 'email',
            value: 'john@example.com',
            operation: QueryOperationType.EQUALS,
          },
          {
            field: 'age',
            value: 18,
            operation: QueryOperationType.GREATER_THAN,
          },
        ],
        indexName: 'email_index',
        limit: 10,
        select: ['userId', 'name', 'email'],
        keyCondition: {
          expression: expect.stringContaining('email = :keyValue'),
          values: {
            ':keyValue': 'john@example.com',
          },
        },
      });
    });

    it('should handle complex query conditions', () => {
      const query = new QueryBuilder()
        .equals('status', 'active')
        .between('age', 18, 30)
        .contains('interests', 'coding')
        .in('role', ['admin', 'user'])
        .beginsWith('name', 'John')
        .build();

      expect(query.conditions).toHaveLength(5);
      expect(query.conditions).toEqual([
        {
          field: 'status',
          value: 'active',
          operation: QueryOperationType.EQUALS,
        },
        {
          field: 'age',
          value: [18, 30],
          operation: QueryOperationType.BETWEEN,
        },
        {
          field: 'interests',
          value: 'coding',
          operation: QueryOperationType.CONTAINS,
        },
        {
          field: 'role',
          value: ['admin', 'user'],
          operation: QueryOperationType.IN,
        },
        {
          field: 'name',
          value: 'John',
          operation: QueryOperationType.BEGINS_WITH,
        },
      ]);

      // Verify keyCondition is present
      expect(query.keyCondition).toBeDefined();
      expect(query.keyCondition).toHaveProperty('expression');
      expect(query.keyCondition).toHaveProperty('values');
    });
  });

  describe('Integration Tests', () => {
    it('should combine builders for a complete operation', () => {
      // Create client configuration
      const config = new ClientBuilder()
        .withRegion('us-east-1')
        .withTableName('test-table')
        .withEndpoint('http://localhost:8000')
        .withConsistentRead(false)
        .withClientOptions({
          credentials: {
            accessKeyId: 'local',
            secretAccessKey: 'local',
          },
        })
        .build();

      // Verify client configuration
      expect(config).toMatchObject({
        tableName: 'test-table',
        consistentRead: false,
      });

      // Create update operation
      const updates = new UpdateBuilder()
        .set('lastLogin', new Date().toISOString())
        .increment('loginCount', 1)
        .build();

      // Create query operation
      const query = new QueryBuilder()
        .equals('status', 'active')
        .greaterThan('loginCount', 5)
        .build();

      // Verify the builders produced valid output
      expect(updates).toHaveLength(2);
      expect(query.conditions).toHaveLength(2);
      expect(updates[0].operation).toBe(UpdateOperationType.SET);
      expect(updates[1].operation).toBe(UpdateOperationType.ADD);
      expect(query.conditions[0].operation).toBe(QueryOperationType.EQUALS);
      expect(query.conditions[1].operation).toBe(QueryOperationType.GREATER_THAN);
    });
  });
});
