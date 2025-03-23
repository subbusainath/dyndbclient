import {
  DynamoDBStreamsClient,
  ListStreamsCommand,
  DescribeStreamCommand,
  GetShardIteratorCommand,
  GetRecordsCommand,
  ShardIteratorType,
} from '@aws-sdk/client-dynamodb-streams';
import {
  getTableStreamArn,
  describeStream,
  getShardIterator,
  getStreamRecords,
  StreamRecord,
} from '../src/operations/stream';

// Mock the DynamoDBStreamsClient
jest.mock('@aws-sdk/client-dynamodb-streams', () => {
  return {
    DynamoDBStreamsClient: jest.fn(() => ({
      send: jest.fn(),
    })),
    ListStreamsCommand: jest.fn(),
    DescribeStreamCommand: jest.fn(),
    GetShardIteratorCommand: jest.fn(),
    GetRecordsCommand: jest.fn(),
    ShardIteratorType: {
      LATEST: 'LATEST',
      TRIM_HORIZON: 'TRIM_HORIZON',
      AT_SEQUENCE_NUMBER: 'AT_SEQUENCE_NUMBER',
      AFTER_SEQUENCE_NUMBER: 'AFTER_SEQUENCE_NUMBER',
    },
  };
});

describe('Stream Operations', () => {
  let client: DynamoDBStreamsClient;
  const mockStreamArn =
    'arn:aws:dynamodb:us-east-1:123456789012:table/TestTable/stream/2024-03-23T12:00:00.000';
  const mockShardId = 'shardId-00000001';
  const mockShardIterator =
    'arn:aws:dynamodb:us-east-1:123456789012:table/TestTable/stream/shardIterator';

  beforeEach(() => {
    jest.clearAllMocks();
    client = new DynamoDBStreamsClient({});
  });

  describe('getTableStreamArn', () => {
    it('should get the stream ARN for a table', async () => {
      // Setup mock response
      const mockResponse = {
        Streams: [
          {
            StreamArn: mockStreamArn,
            TableName: 'TestTable',
            StreamCreationTimestamp: new Date(),
          },
        ],
      };

      (client.send as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getTableStreamArn(client, 'TestTable');

      // Verify ListStreamsCommand was called correctly
      expect(ListStreamsCommand).toHaveBeenCalledWith({
        TableName: 'TestTable',
      });

      // Verify the response
      expect(result.success).toBe(true);
      expect(result.data.streamArn).toBe(mockStreamArn);
    });

    it('should handle tables without streams', async () => {
      // Setup mock response
      const mockResponse = {
        Streams: [],
      };

      (client.send as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getTableStreamArn(client, 'TestTable');

      // Verify the response
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('No streams found for table');
    });

    it('should handle errors', async () => {
      // Setup mock error
      const mockError = new Error('AWS connection error');
      (client.send as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await getTableStreamArn(client, 'TestTable');

      // Verify the response
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Failed to get stream ARN');
    });
  });

  describe('describeStream', () => {
    it('should describe a stream', async () => {
      // Setup mock response
      const mockResponse = {
        StreamDescription: {
          StreamArn: mockStreamArn,
          StreamStatus: 'ACTIVE',
          StreamViewType: 'NEW_AND_OLD_IMAGES',
          Shards: [
            {
              ShardId: mockShardId,
              SequenceNumberRange: {
                StartingSequenceNumber: '123456789012345678901',
              },
            },
          ],
        },
      };

      (client.send as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await describeStream(client, mockStreamArn);

      // Verify DescribeStreamCommand was called correctly
      expect(DescribeStreamCommand).toHaveBeenCalledWith({
        StreamArn: mockStreamArn,
      });

      // Verify the response
      expect(result.success).toBe(true);
      expect(result.data.streamDescription).toBeDefined();
      expect(result.data.streamDescription.Shards).toHaveLength(1);
      expect(result.data.streamDescription.Shards[0].ShardId).toBe(mockShardId);
    });

    it('should handle errors', async () => {
      // Setup mock error
      const mockError = new Error('Stream not found');
      (client.send as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await describeStream(client, mockStreamArn);

      // Verify the response
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Failed to describe stream');
    });
  });

  describe('getShardIterator', () => {
    it('should get a shard iterator', async () => {
      // Setup mock response
      const mockResponse = {
        ShardIterator: mockShardIterator,
      };

      (client.send as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getShardIterator(
        client,
        mockStreamArn,
        mockShardId,
        ShardIteratorType.TRIM_HORIZON
      );

      // Verify GetShardIteratorCommand was called correctly
      expect(GetShardIteratorCommand).toHaveBeenCalledWith({
        StreamArn: mockStreamArn,
        ShardId: mockShardId,
        ShardIteratorType: ShardIteratorType.TRIM_HORIZON,
        SequenceNumber: undefined,
      });

      // Verify the response
      expect(result.success).toBe(true);
      expect(result.data.shardIterator).toBe(mockShardIterator);
    });

    it('should handle errors', async () => {
      // Setup mock error
      const mockError = new Error('Invalid shard ID');
      (client.send as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await getShardIterator(
        client,
        mockStreamArn,
        mockShardId,
        ShardIteratorType.TRIM_HORIZON
      );

      // Verify the response
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Failed to get shard iterator');
    });
  });

  describe('getStreamRecords', () => {
    it('should get records from a stream', async () => {
      // Setup mock response
      const mockResponse = {
        Records: [
          {
            eventID: 'event1',
            eventName: 'INSERT',
            eventVersion: '1.0',
            eventSource: 'aws:dynamodb',
            awsRegion: 'us-east-1',
            dynamodb: {
              Keys: { id: { S: '123' } },
              NewImage: { id: { S: '123' }, name: { S: 'Test Item' } },
              SequenceNumber: '123456789012345678901',
              SizeBytes: 100,
              StreamViewType: 'NEW_AND_OLD_IMAGES',
            },
          },
        ],
        NextShardIterator: 'next-shard-iterator',
      };

      (client.send as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await getStreamRecords(client, mockShardIterator, 10);

      // Verify GetRecordsCommand was called correctly
      expect(GetRecordsCommand).toHaveBeenCalledWith({
        ShardIterator: mockShardIterator,
        Limit: 10,
      });

      // Verify the response
      expect(result.success).toBe(true);
      expect(result.data.records).toHaveLength(1);
      expect(result.data.nextShardIterator).toBe('next-shard-iterator');

      // Verify the record format
      const record = result.data.records[0] as StreamRecord;
      expect(record.eventID).toBe('event1');
      expect(record.eventName).toBe('INSERT');
      expect(record.dynamodb.Keys).toBeDefined();
      expect(record.dynamodb.NewImage).toBeDefined();
    });

    it('should handle errors', async () => {
      // Setup mock error
      const mockError = new Error('Invalid shard iterator');
      (client.send as jest.Mock).mockRejectedValueOnce(mockError);

      const result = await getStreamRecords(client, mockShardIterator);

      // Verify the response
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Failed to get stream records');
    });
  });
});
