import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { scanTable } from '../../operations/scan';

describe('scanTable', () => {
  const mockClient = {
    send: jest.fn(),
  } as unknown as DynamoDBDocumentClient & { send: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should scan table successfully', async () => {
    const mockItems = [
      { id: '1', name: 'Test 1' },
      { id: '2', name: 'Test 2' },
    ];

    mockClient.send.mockResolvedValueOnce({
      Items: mockItems,
      Count: 2,
      ScannedCount: 2,
    });

    const result = await scanTable(mockClient, 'TestTable');

    expect(result.success).toBe(true);
    expect(result.data.items).toEqual(mockItems);
    expect(result.data.count).toBe(2);
    expect(mockClient.send).toHaveBeenCalledWith(expect.any(ScanCommand));
  });

  it('should handle filter expressions', async () => {
    await scanTable(mockClient, 'TestTable', {
      filter: 'age > :minAge',
      expressionValues: { ':minAge': 18 },
    });

    expect(mockClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          FilterExpression: 'age > :minAge',
          ExpressionAttributeValues: { ':minAge': 18 },
        }),
      })
    );
  });

  it('should handle pagination', async () => {
    const mockLastKey = { id: 'lastKey' };
    mockClient.send.mockResolvedValueOnce({
      Items: [{ id: '1' }],
      LastEvaluatedKey: mockLastKey,
    });

    const result = await scanTable(mockClient, 'TestTable', {
      limit: 1,
    });

    expect(result.data.nextToken).toEqual(mockLastKey);
  });

  it('should handle parallel scan', async () => {
    await scanTable(mockClient, 'TestTable', {
      segment: 0,
      totalSegments: 4,
    });

    expect(mockClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          Segment: 0,
          TotalSegments: 4,
        }),
      })
    );
  });

  it('should handle projection attributes', async () => {
    await scanTable(mockClient, 'TestTable', {
      attributes: ['id', 'name'],
    });

    expect(mockClient.send).toHaveBeenCalledWith(
      expect.objectContaining({
        input: expect.objectContaining({
          ProjectionExpression: 'id, name',
        }),
      })
    );
  });
});
