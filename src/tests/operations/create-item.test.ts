import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { createItem } from '../../operations/create';
import { TableSchema, DynamoAttributeType } from '../../types/schema';

describe('createItem', () => {
  const mockClient = {
    send: jest.fn().mockImplementation(() => Promise.resolve({})),
  } as unknown as DynamoDBDocumentClient & { send: jest.Mock };

  const mockSchema: TableSchema = {
    tableName: 'TestTable',
    attributes: {
      id: { type: DynamoAttributeType.String, required: true },
      name: { type: DynamoAttributeType.String, required: true },
    },
    primaryKey: {
      partitionKey: 'id',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create item successfully', async () => {
    const mockItem = { id: '123', name: 'Test' };
    mockClient.send.mockResolvedValueOnce({});

    const result = await createItem(mockClient, 'TestTable', mockItem, mockSchema);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockItem);
    expect(mockClient.send).toHaveBeenCalledWith(expect.any(PutCommand));
  });

  it('should validate item against schema', async () => {
    const invalidItem = { id: '123' }; // missing required name field

    await expect(createItem(mockClient, 'TestTable', invalidItem, mockSchema)).rejects.toThrow(
      'Schema validation failed'
    );
  });

  it('should handle conditional create', async () => {
    const mockItem = { id: '123', name: 'Test' };
    const options = {
      condition: 'attribute_not_exists(id)',
    };

    await createItem(mockClient, 'TestTable', mockItem, mockSchema, options);

    expect(mockClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          ConditionExpression: options.condition,
        }),
      })
    );
  });
});
