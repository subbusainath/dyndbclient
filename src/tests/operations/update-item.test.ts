import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { UpdateBuilder, updateItem } from '../../operations/update';
import { TableSchema, DynamoAttributeType } from '../../types/schema';

describe('Update Operations', () => {
  const mockClient = {
    send: jest.fn(),
  } as unknown as DynamoDBDocumentClient & { send: jest.Mock };

  const mockSchema: TableSchema = {
    tableName: 'TestTable',
    attributes: {
      id: { type: DynamoAttributeType.String, required: true },
      name: { type: DynamoAttributeType.String },
      age: { type: DynamoAttributeType.Number },
      hobbies: { type: DynamoAttributeType.List },
    },
    primaryKey: {
      partitionKey: 'id',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UpdateBuilder', () => {
    let builder: UpdateBuilder;

    beforeEach(() => {
      builder = new UpdateBuilder(mockSchema);
    });

    it('should build SET expression', () => {
      const built = builder.set('name', 'Test').set('age', 25).build();

      expect(built.updateExpression).toContain('SET');
      expect(built.expressionAttributeValues).toHaveProperty(':name', 'Test');
      expect(built.expressionAttributeValues).toHaveProperty(':age', 25);
    });

    it('should build list append operation', () => {
      const built = builder.appendToList('hobbies', ['reading']).build();

      expect(built.updateExpression).toContain('SET');
      expect(built.updateExpression).toContain('list_append');
      expect(built.updateExpression).toMatch(/hobbies\s*=\s*list_append\(.*\)/);
      expect(built.expressionAttributeValues).toHaveProperty(':hobbies_append');

      // Verify that hobbies array is the value to be appended
      expect(built.expressionAttributeValues[':hobbies_append']).toEqual(['reading']);
    });

    it('should build list prepend operation', () => {
      const built = builder.prependToList('hobbies', ['gaming']).build();

      expect(built.updateExpression).toContain('SET');
      expect(built.updateExpression).toContain('list_append');
      expect(built.updateExpression).toMatch(/hobbies\s*=\s*list_append\(.*\)/);
      expect(built.expressionAttributeValues).toHaveProperty(':hobbies_prepend');

      // Verify that hobbies array is the value to be prepended
      expect(built.expressionAttributeValues[':hobbies_prepend']).toEqual(['gaming']);
    });

    it('should handle multiple list operations', () => {
      const built = builder
        .appendToList('hobbies', ['reading'])
        .prependToList('hobbies', ['gaming'])
        .build();

      // Should have two separate operations
      expect(built.updateExpression.split('SET ')[1].split(',').length).toBeGreaterThanOrEqual(2);
      expect(built.expressionAttributeValues).toHaveProperty(':hobbies_append');
      expect(built.expressionAttributeValues).toHaveProperty(':hobbies_prepend');
    });

    it('should validate fields against schema', () => {
      expect(() => builder.set('invalid', 'value')).toThrow();
    });
  });

  describe('updateItem', () => {
    it('should update item using builder', async () => {
      const builder = new UpdateBuilder(mockSchema).set('name', 'Test').increment('age', 1);

      const result = await updateItem(mockClient, 'TestTable', { id: '123' }, builder, mockSchema);

      expect(result.success).toBe(true);
      expect(mockClient.send).toHaveBeenCalledWith(expect.any(UpdateCommand));
    });

    it('should handle list append operations', async () => {
      const builder = new UpdateBuilder(mockSchema).appendToList('hobbies', ['reading']);

      await updateItem(mockClient, 'TestTable', { id: '123' }, builder, mockSchema);

      expect(mockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            UpdateExpression: expect.stringContaining('list_append'),
            ExpressionAttributeValues: expect.objectContaining({
              ':hobbies_append': ['reading'],
            }),
          }),
        })
      );
    });

    it('should handle conditional updates', async () => {
      const builder = new UpdateBuilder(mockSchema).set('name', 'Test');

      await updateItem(mockClient, 'TestTable', { id: '123' }, builder, mockSchema, {
        condition: 'attribute_exists(id)',
      });

      expect(mockClient.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            ConditionExpression: 'attribute_exists(id)',
          }),
        })
      );
    });
  });
});
