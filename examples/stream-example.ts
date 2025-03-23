import { ClientBuilder } from '../src/core/client-builder';
import { ShardIteratorType } from '@aws-sdk/client-dynamodb-streams';
import { StreamRecord } from '../src/operations/stream';

async function main() {
  try {
    // Create a client using the builder pattern
    const db = new ClientBuilder()
      .withRegion('local')
      .withTableName('Users')
      .withEndpoint('http://localhost:8000')
      .withClientOptions({
        credentials: {
          accessKeyId: 'local',
          secretAccessKey: 'local',
        },
      })
      .build();

    console.log('Getting stream ARN for the table...');
    const streamArnResult = await db.getStreamArn();

    if (!streamArnResult.success) {
      console.error(
        'Failed to get stream ARN. Make sure streams are enabled on the table:',
        streamArnResult.error
      );
      console.log(
        'To enable streams on a new table, you need to specify StreamSpecification when creating the table.'
      );
      console.log(
        'For local development with DynamoDB Local, you can create a table with streams using the create-table.js script:'
      );
      console.log('node create-table.js Users --stream NEW_AND_OLD_IMAGES');
      return;
    }

    const streamArn = streamArnResult.data.streamArn;
    console.log('Stream ARN:', streamArn);

    // Describe the stream to get information about its shards
    console.log('\nGetting information about the stream...');
    const streamInfoResult = await db.describeStream(streamArn);

    if (!streamInfoResult.success) {
      console.error('Failed to describe stream:', streamInfoResult.error);
      return;
    }

    const streamDescription = streamInfoResult.data.streamDescription;
    console.log('Stream Status:', streamDescription.StreamStatus);
    console.log('Stream View Type:', streamDescription.StreamViewType);
    console.log('Shards:', streamDescription.Shards?.length || 0);

    if (!streamDescription.Shards || streamDescription.Shards.length === 0) {
      console.log('No shards found in the stream. Try making some changes to the table first.');
      return;
    }

    // Get a shard iterator
    const shardId = streamDescription.Shards[0].ShardId!;
    console.log('\nGetting iterator for shard:', shardId);

    const iteratorResult = await db.getShardIterator(
      streamArn,
      shardId,
      ShardIteratorType.TRIM_HORIZON
    );

    if (!iteratorResult.success) {
      console.error('Failed to get shard iterator:', iteratorResult.error);
      return;
    }

    const shardIterator = iteratorResult.data.shardIterator;
    console.log('Shard Iterator:', shardIterator.substring(0, 50) + '...');

    // Get records from the stream
    console.log('\nGetting records from the stream...');
    const recordsResult = await db.getStreamRecords(shardIterator, 10);

    if (!recordsResult.success) {
      console.error('Failed to get stream records:', recordsResult.error);
      return;
    }

    const records = recordsResult.data.records;
    console.log(`Retrieved ${records.length} records from the stream`);

    if (records.length > 0) {
      console.log('\nExample record:');
      const exampleRecord = records[0];
      console.log('Event ID:', exampleRecord.eventID);
      console.log('Event Name:', exampleRecord.eventName);
      console.log('Keys:', JSON.stringify(exampleRecord.dynamodb.Keys));

      if (exampleRecord.dynamodb.NewImage) {
        console.log('New Image:', JSON.stringify(exampleRecord.dynamodb.NewImage));
      }

      if (exampleRecord.dynamodb.OldImage) {
        console.log('Old Image:', JSON.stringify(exampleRecord.dynamodb.OldImage));
      }
    } else {
      console.log(
        'No records found. Try making some changes to the table and run this example again.'
      );

      // Let's make some changes to generate stream events
      console.log('\nCreating, updating, and deleting items to generate stream events...');

      // Create a new user
      const createResult = await db.create({
        userId: 'stream-user1',
        name: 'Stream Test User',
        email: 'stream@example.com',
        age: 30,
        interests: ['streams'],
        createdAt: new Date().toISOString(),
      });

      if (createResult.success) {
        console.log('Created a new user to generate stream event');
      }

      // Update the user
      await db.update({ userId: 'stream-user1' }, [
        { field: 'name', value: 'Updated Stream User', operation: 'SET' },
        { field: 'age', value: 1, operation: 'ADD' },
      ]);

      console.log('Updated the user to generate stream event');

      // Delete the user
      await db.delete({ userId: 'stream-user1' });
      console.log('Deleted the user to generate stream event');

      console.log('\nRun this example again to see the stream events.');
    }

    // Demonstrate continuous stream processing
    if (process.env.PROCESS_STREAM === 'true') {
      console.log('\nStarting continuous stream processing...');
      console.log('Press Ctrl+C to stop.');

      // This would normally run indefinitely, but we'll limit it for example purposes
      const processConfig = {
        batchSize: 10,
        maxRecords: 100, // Limit to prevent running indefinitely in the example
        pollInterval: 1000,
        stopOnError: false,
      };

      // Define a handler for stream records
      const streamHandler = async (records: StreamRecord[]) => {
        for (const record of records) {
          console.log(`Processed ${record.eventName} event:`, record.dynamodb.Keys);

          // In a real application, you would process these records according to your business logic
          // For example, updating a search index, triggering notifications, etc.
        }
      };

      try {
        await db.processStream(streamArn, streamHandler, processConfig);
        console.log('Stream processing completed (reached maxRecords limit)');
      } catch (error) {
        console.error('Error in stream processing:', error);
      }
    } else {
      console.log('\nTo enable continuous stream processing, run with:');
      console.log('PROCESS_STREAM=true ts-node stream-example.ts');
    }
  } catch (error) {
    console.error('Error in main:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the example
console.log('Starting stream example...');
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
