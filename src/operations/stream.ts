import {
  DynamoDBStreamsClient,
  DescribeStreamCommand,
  GetRecordsCommand,
  GetShardIteratorCommand,
  ListStreamsCommand,
  ShardIteratorType,
  _Record,
} from '@aws-sdk/client-dynamodb-streams';
import { handleError } from '../core/error-handler';
import { OperationResponse } from '../types';

// Re-export ShardIteratorType for convenience
export { ShardIteratorType } from '@aws-sdk/client-dynamodb-streams';

/**
 * Stream options to configure the stream processing
 */
export interface StreamOptions {
  tableName?: string;
  streamArn?: string;
  startingPosition?: 'LATEST' | 'TRIM_HORIZON' | 'AT_SEQUENCE_NUMBER' | 'AFTER_SEQUENCE_NUMBER';
  sequenceNumber?: string;
  batchSize?: number;
  maxRecords?: number;
  region?: string;
  endpoint?: string;
  clientOptions?: any;
}

/**
 * Stream record interface representing a change in the table
 */
export interface StreamRecord {
  eventID: string;
  eventName: 'INSERT' | 'MODIFY' | 'REMOVE';
  eventVersion: string;
  eventSource: string;
  awsRegion: string;
  dynamodb: {
    Keys: Record<string, any>;
    NewImage?: Record<string, any>;
    OldImage?: Record<string, any>;
    SequenceNumber: string;
    SizeBytes: number;
    StreamViewType: 'NEW_IMAGE' | 'OLD_IMAGE' | 'NEW_AND_OLD_IMAGES' | 'KEYS_ONLY';
  };
  userIdentity?: {
    type: string;
    principalId: string;
  };
}

/**
 * Stream processor handler function type
 */
export type StreamHandler = (records: StreamRecord[]) => Promise<void>;

/**
 * Stream iterator types
 */
export enum StreamIteratorType {
  LATEST = 'LATEST',
  TRIM_HORIZON = 'TRIM_HORIZON',
  AT_SEQUENCE_NUMBER = 'AT_SEQUENCE_NUMBER',
  AFTER_SEQUENCE_NUMBER = 'AFTER_SEQUENCE_NUMBER',
}

/**
 * Stream processing configuration
 */
export interface StreamProcessingConfig {
  batchSize: number;
  maxRecords: number;
  pollInterval: number;
  stopOnError: boolean;
}

/**
 * Get the stream ARN for a table
 */
export async function getTableStreamArn(
  client: DynamoDBStreamsClient,
  tableName: string
): Promise<OperationResponse> {
  try {
    const command = new ListStreamsCommand({
      TableName: tableName,
    });

    const response = await client.send(command);

    if (!response.Streams || response.Streams.length === 0) {
      return {
        success: false,
        error: new Error(`No streams found for table ${tableName}`),
      };
    }

    // Usually we want the latest stream
    const latestStream = response.Streams.sort((a, b) => {
      const aTime = a.StreamLabel ? new Date(a.StreamLabel).getTime() : 0;
      const bTime = b.StreamLabel ? new Date(b.StreamLabel).getTime() : 0;
      return bTime - aTime;
    })[0];

    return {
      success: true,
      data: {
        streamArn: latestStream.StreamArn,
      },
    };
  } catch (error) {
    return handleError(`Failed to get stream ARN for table ${tableName}`, error);
  }
}

/**
 * Get information about a stream
 */
export async function describeStream(
  client: DynamoDBStreamsClient,
  streamArn: string
): Promise<OperationResponse> {
  try {
    const command = new DescribeStreamCommand({
      StreamArn: streamArn,
    });

    const response = await client.send(command);

    if (!response.StreamDescription) {
      return {
        success: false,
        error: new Error(`No stream description found for ${streamArn}`),
      };
    }

    return {
      success: true,
      data: {
        streamDescription: response.StreamDescription,
      },
    };
  } catch (error) {
    return handleError(`Failed to describe stream ${streamArn}`, error);
  }
}

/**
 * Get a shard iterator for a stream
 */
export async function getShardIterator(
  client: DynamoDBStreamsClient,
  streamArn: string,
  shardId: string,
  iteratorType: ShardIteratorType,
  sequenceNumber?: string
): Promise<OperationResponse> {
  try {
    const command = new GetShardIteratorCommand({
      StreamArn: streamArn,
      ShardId: shardId,
      ShardIteratorType: iteratorType,
      SequenceNumber: sequenceNumber,
    });

    const response = await client.send(command);

    if (!response.ShardIterator) {
      return {
        success: false,
        error: new Error(`No shard iterator returned for shard ${shardId}`),
      };
    }

    return {
      success: true,
      data: {
        shardIterator: response.ShardIterator,
      },
    };
  } catch (error) {
    return handleError(`Failed to get shard iterator for shard ${shardId}`, error);
  }
}

/**
 * Get records from a stream using a shard iterator
 */
export async function getStreamRecords(
  client: DynamoDBStreamsClient,
  shardIterator: string,
  limit?: number
): Promise<OperationResponse> {
  try {
    const command = new GetRecordsCommand({
      ShardIterator: shardIterator,
      Limit: limit,
    });

    const response = await client.send(command);

    // Convert DynamoDB records to more friendly format
    const records = response.Records?.map(convertDynamoDBRecord) || [];

    return {
      success: true,
      data: {
        records,
        nextShardIterator: response.NextShardIterator,
      },
    };
  } catch (error) {
    return handleError('Failed to get stream records', error);
  }
}

/**
 * Process a stream continuously with a handler function
 */
export async function processStream(
  client: DynamoDBStreamsClient,
  streamArn: string,
  handler: StreamHandler,
  config: Partial<StreamProcessingConfig> = {}
): Promise<void> {
  // Default configuration values
  const processingConfig: StreamProcessingConfig = {
    batchSize: config.batchSize || 100,
    maxRecords: config.maxRecords || Infinity,
    pollInterval: config.pollInterval || 1000,
    stopOnError: config.stopOnError || false,
  };

  try {
    // Describe the stream to get shards
    const describeResult = await describeStream(client, streamArn);
    if (!describeResult.success) {
      throw describeResult.error;
    }

    const streamDescription = describeResult.data.streamDescription;
    const shards = streamDescription.Shards || [];

    if (shards.length === 0) {
      throw new Error('No shards found in the stream');
    }

    let processedRecords = 0;

    // Process each shard
    for (const shard of shards) {
      let shardIteratorType: ShardIteratorType = ShardIteratorType.TRIM_HORIZON;
      let nextShardIterator: string | undefined;

      // Get the initial shard iterator
      const iteratorResult = await getShardIterator(
        client,
        streamArn,
        shard.ShardId!,
        shardIteratorType
      );

      if (!iteratorResult.success) {
        throw iteratorResult.error;
      }

      nextShardIterator = iteratorResult.data.shardIterator;

      // Process records until no more are available or we reach maxRecords
      while (nextShardIterator && processedRecords < processingConfig.maxRecords) {
        const recordsResult = await getStreamRecords(
          client,
          nextShardIterator,
          processingConfig.batchSize
        );

        if (!recordsResult.success) {
          if (processingConfig.stopOnError) {
            throw recordsResult.error;
          } else {
            console.error('Error getting stream records:', recordsResult.error);
            await new Promise(resolve => setTimeout(resolve, processingConfig.pollInterval));
            continue;
          }
        }

        const { records, nextShardIterator: newIterator } = recordsResult.data;
        nextShardIterator = newIterator;

        if (records.length > 0) {
          try {
            await handler(records);
            processedRecords += records.length;
          } catch (error) {
            if (processingConfig.stopOnError) {
              throw error;
            } else {
              console.error('Error in stream handler:', error);
            }
          }
        }

        // If no records were returned, wait before polling again
        if (records.length === 0) {
          await new Promise(resolve => setTimeout(resolve, processingConfig.pollInterval));
        }
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Convert a DynamoDB stream record to a friendly format
 */
function convertDynamoDBRecord(record: _Record): StreamRecord {
  return {
    eventID: record.eventID!,
    eventName: record.eventName as 'INSERT' | 'MODIFY' | 'REMOVE',
    eventVersion: record.eventVersion!,
    eventSource: record.eventSource!,
    awsRegion: record.awsRegion!,
    dynamodb: {
      Keys: record.dynamodb?.Keys || {},
      NewImage: record.dynamodb?.NewImage,
      OldImage: record.dynamodb?.OldImage,
      SequenceNumber: record.dynamodb?.SequenceNumber!,
      SizeBytes: record.dynamodb?.SizeBytes!,
      StreamViewType: record.dynamodb?.StreamViewType as
        | 'NEW_IMAGE'
        | 'OLD_IMAGE'
        | 'NEW_AND_OLD_IMAGES'
        | 'KEYS_ONLY',
    },
    userIdentity: record.userIdentity
      ? {
          type: record.userIdentity.Type || 'Unknown',
          principalId: record.userIdentity.PrincipalId || 'Unknown',
        }
      : undefined,
  };
}
