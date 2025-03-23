import { DynamoDBStreamsClient, ShardIteratorType } from "@aws-sdk/client-dynamodb-streams";
import { OperationResponse } from '../types';
export { ShardIteratorType } from "@aws-sdk/client-dynamodb-streams";
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
export declare enum StreamIteratorType {
    LATEST = "LATEST",
    TRIM_HORIZON = "TRIM_HORIZON",
    AT_SEQUENCE_NUMBER = "AT_SEQUENCE_NUMBER",
    AFTER_SEQUENCE_NUMBER = "AFTER_SEQUENCE_NUMBER"
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
export declare function getTableStreamArn(client: DynamoDBStreamsClient, tableName: string): Promise<OperationResponse>;
/**
 * Get information about a stream
 */
export declare function describeStream(client: DynamoDBStreamsClient, streamArn: string): Promise<OperationResponse>;
/**
 * Get a shard iterator for a stream
 */
export declare function getShardIterator(client: DynamoDBStreamsClient, streamArn: string, shardId: string, iteratorType: ShardIteratorType, sequenceNumber?: string): Promise<OperationResponse>;
/**
 * Get records from a stream using a shard iterator
 */
export declare function getStreamRecords(client: DynamoDBStreamsClient, shardIterator: string, limit?: number): Promise<OperationResponse>;
/**
 * Process a stream continuously with a handler function
 */
export declare function processStream(client: DynamoDBStreamsClient, streamArn: string, handler: StreamHandler, config?: Partial<StreamProcessingConfig>): Promise<void>;
