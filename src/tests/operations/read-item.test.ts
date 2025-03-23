import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { readItem } from '../../operations/read';

describe('readItem', () => {
  const mockClient = {
    send: jest.fn(),
  } as unknown as DynamoDBDocumentClient & { send: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should read item successfully', async () => {
    const mockItem = { id: '123', name: 'Test' };
    mockClient.send.mockResolvedValueOnce({ Item: mockItem });

    const result = await readItem(mockClient, 'TestTable', { id: '123' });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockItem);
    expect(mockClient.send).toHaveBeenCalledWith(expect.any(GetCommand));
  });

  it('should handle non-existent item', async () => {
    mockClient.send.mockResolvedValueOnce({ Item: null });

    const result = await readItem(mockClient, 'TestTable', { id: 'nonexistent' });

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
  });

  it('should handle projection attributes', async () => {
    await readItem(mockClient, 'TestTable', { id: '123' }, { attributes: ['name', 'age'] });

    expect(mockClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          ProjectionExpression: 'name, age',
        }),
      })
    );
  });

  it('should handle consistent reads', async () => {
    await readItem(mockClient, 'TestTable', { id: '123' }, { consistent: true });

    expect(mockClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          ConsistentRead: true,
        }),
      })
    );
  });
});
