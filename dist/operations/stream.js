"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamIteratorType = exports.ShardIteratorType = void 0;
exports.getTableStreamArn = getTableStreamArn;
exports.describeStream = describeStream;
exports.getShardIterator = getShardIterator;
exports.getStreamRecords = getStreamRecords;
exports.processStream = processStream;
const client_dynamodb_streams_1 = require("@aws-sdk/client-dynamodb-streams");
const error_handler_1 = require("../core/error-handler");
// Re-export ShardIteratorType for convenience
var client_dynamodb_streams_2 = require("@aws-sdk/client-dynamodb-streams");
Object.defineProperty(exports, "ShardIteratorType", { enumerable: true, get: function () { return client_dynamodb_streams_2.ShardIteratorType; } });
/**
 * Stream iterator types
 */
var StreamIteratorType;
(function (StreamIteratorType) {
    StreamIteratorType["LATEST"] = "LATEST";
    StreamIteratorType["TRIM_HORIZON"] = "TRIM_HORIZON";
    StreamIteratorType["AT_SEQUENCE_NUMBER"] = "AT_SEQUENCE_NUMBER";
    StreamIteratorType["AFTER_SEQUENCE_NUMBER"] = "AFTER_SEQUENCE_NUMBER";
})(StreamIteratorType || (exports.StreamIteratorType = StreamIteratorType = {}));
/**
 * Get the stream ARN for a table
 */
async function getTableStreamArn(client, tableName) {
    try {
        const command = new client_dynamodb_streams_1.ListStreamsCommand({
            TableName: tableName
        });
        const response = await client.send(command);
        if (!response.Streams || response.Streams.length === 0) {
            return {
                success: false,
                error: new Error(`No streams found for table ${tableName}`)
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
                streamArn: latestStream.StreamArn
            }
        };
    }
    catch (error) {
        return (0, error_handler_1.handleError)(`Failed to get stream ARN for table ${tableName}`, error);
    }
}
/**
 * Get information about a stream
 */
async function describeStream(client, streamArn) {
    try {
        const command = new client_dynamodb_streams_1.DescribeStreamCommand({
            StreamArn: streamArn
        });
        const response = await client.send(command);
        if (!response.StreamDescription) {
            return {
                success: false,
                error: new Error(`No stream description found for ${streamArn}`)
            };
        }
        return {
            success: true,
            data: {
                streamDescription: response.StreamDescription
            }
        };
    }
    catch (error) {
        return (0, error_handler_1.handleError)(`Failed to describe stream ${streamArn}`, error);
    }
}
/**
 * Get a shard iterator for a stream
 */
async function getShardIterator(client, streamArn, shardId, iteratorType, sequenceNumber) {
    try {
        const command = new client_dynamodb_streams_1.GetShardIteratorCommand({
            StreamArn: streamArn,
            ShardId: shardId,
            ShardIteratorType: iteratorType,
            SequenceNumber: sequenceNumber
        });
        const response = await client.send(command);
        if (!response.ShardIterator) {
            return {
                success: false,
                error: new Error(`No shard iterator returned for shard ${shardId}`)
            };
        }
        return {
            success: true,
            data: {
                shardIterator: response.ShardIterator
            }
        };
    }
    catch (error) {
        return (0, error_handler_1.handleError)(`Failed to get shard iterator for shard ${shardId}`, error);
    }
}
/**
 * Get records from a stream using a shard iterator
 */
async function getStreamRecords(client, shardIterator, limit) {
    try {
        const command = new client_dynamodb_streams_1.GetRecordsCommand({
            ShardIterator: shardIterator,
            Limit: limit
        });
        const response = await client.send(command);
        // Convert DynamoDB records to more friendly format
        const records = response.Records?.map(convertDynamoDBRecord) || [];
        return {
            success: true,
            data: {
                records,
                nextShardIterator: response.NextShardIterator
            }
        };
    }
    catch (error) {
        return (0, error_handler_1.handleError)('Failed to get stream records', error);
    }
}
/**
 * Process a stream continuously with a handler function
 */
async function processStream(client, streamArn, handler, config = {}) {
    // Default configuration values
    const processingConfig = {
        batchSize: config.batchSize || 100,
        maxRecords: config.maxRecords || Infinity,
        pollInterval: config.pollInterval || 1000,
        stopOnError: config.stopOnError || false
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
            let shardIteratorType = client_dynamodb_streams_1.ShardIteratorType.TRIM_HORIZON;
            let nextShardIterator;
            // Get the initial shard iterator
            const iteratorResult = await getShardIterator(client, streamArn, shard.ShardId, shardIteratorType);
            if (!iteratorResult.success) {
                throw iteratorResult.error;
            }
            nextShardIterator = iteratorResult.data.shardIterator;
            // Process records until no more are available or we reach maxRecords
            while (nextShardIterator && processedRecords < processingConfig.maxRecords) {
                const recordsResult = await getStreamRecords(client, nextShardIterator, processingConfig.batchSize);
                if (!recordsResult.success) {
                    if (processingConfig.stopOnError) {
                        throw recordsResult.error;
                    }
                    else {
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
                    }
                    catch (error) {
                        if (processingConfig.stopOnError) {
                            throw error;
                        }
                        else {
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
    }
    catch (error) {
        throw error;
    }
}
/**
 * Convert a DynamoDB stream record to a friendly format
 */
function convertDynamoDBRecord(record) {
    return {
        eventID: record.eventID,
        eventName: record.eventName,
        eventVersion: record.eventVersion,
        eventSource: record.eventSource,
        awsRegion: record.awsRegion,
        dynamodb: {
            Keys: record.dynamodb?.Keys || {},
            NewImage: record.dynamodb?.NewImage,
            OldImage: record.dynamodb?.OldImage,
            SequenceNumber: record.dynamodb?.SequenceNumber,
            SizeBytes: record.dynamodb?.SizeBytes,
            StreamViewType: record.dynamodb?.StreamViewType
        },
        userIdentity: record.userIdentity ? {
            type: record.userIdentity.Type || 'Unknown',
            principalId: record.userIdentity.PrincipalId || 'Unknown'
        } : undefined
    };
}
//# sourceMappingURL=stream.js.map