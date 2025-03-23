import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { deleteItem } from '../../operations/delete';

describe('deleteItem', () => {
  const mockClient = {
    send: jest.fn(),
  } as unknown as DynamoDBDocumentClient & { send: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete item successfully', async () => {
    mockClient.send.mockResolvedValueOnce({});

    const result = await deleteItem(mockClient, 'TestTable', { id: '123' });

    expect(result.success).toBe(true);
    expect(mockClient.send).toHaveBeenCalledWith(expect.any(DeleteCommand));
  });

  it('should handle conditional delete', async () => {
    await deleteItem(
      mockClient,
      'TestTable',
      { id: '123' },
      {
        condition: 'attribute_exists(id)',
        expressionValues: { ':status': 'ACTIVE' },
      }
    );

    expect(mockClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          ConditionExpression: 'attribute_exists(id)',
          ExpressionAttributeValues: { ':status': 'ACTIVE' },
        }),
      })
    );
  });

  it('should return old values when specified', async () => {
    const oldItem = { id: '123', name: 'Test' };
    mockClient.send.mockResolvedValueOnce({ Attributes: oldItem });

    const result = await deleteItem(
      mockClient,
      'TestTable',
      { id: '123' },
      { returnValues: 'ALL_OLD' }
    );

    expect(result.success).toBe(true);
    expect(result.data).toEqual(oldItem);
  });
});
