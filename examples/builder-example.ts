import { ClientBuilder } from '../src/core/client-builder';

// Example user interface
interface User {
  userId: string;
  email: string;
  name: string;
  age: number;
  interests: string[];
  createdAt: string;
}

async function main() {
  try {
    // Create a client using the builder pattern with all options
    const db = new ClientBuilder()
      .withRegion('local')
      .withTableName('Users')
      .withEndpoint('http://localhost:8000')
      .withClientOptions({
        credentials: {
          accessKeyId: 'local',
          secretAccessKey: 'local',
        },
        // Additional client options
        requestHandler: {
          connectionTimeout: 3000,
          socketTimeout: 3000,
        },
      })
      .withConsistentRead(true)
      .build();

    console.log('Client successfully initialized');

    // Create a user
    const user: User = {
      userId: 'user123',
      email: 'john@example.com',
      name: 'John Doe',
      age: 30,
      interests: ['coding', 'reading'],
      createdAt: new Date().toISOString(),
    };

    console.log('\nCreating user with data:', user);
    const createResult = await db.create(user, {
      conditionExpression: 'attribute_not_exists(userId) AND attribute_not_exists(email)',
      returnValues: 'NONE',
    });
    if (!createResult.success) {
      console.error('Create operation failed:', createResult.error);
      throw new Error(`Failed to create user: ${createResult.error?.message}`);
    }
    console.log('Create result:', createResult);

    // Read the user
    console.log('\nReading user...');
    const readResult = await db.read({
      userId: 'user123',
      email: 'john@example.com',
    });
    if (!readResult.success) {
      console.error('Read operation failed:', readResult.error);
      throw new Error(`Failed to read user: ${readResult.error?.message}`);
    }
    console.log('Read result:', readResult);

    // Alternative client creation for different use cases
    console.log('\nDemonstrating alternative client configurations:');

    // Example 1: Production client with AWS region
    console.log('\nExample 1: Production client configuration');
    const productionClient = new ClientBuilder()
      .withRegion('us-east-1')
      .withTableName('Users-Production')
      .withClientOptions({
        credentials: {
          accessKeyId: 'YOUR_ACCESS_KEY',
          secretAccessKey: 'YOUR_SECRET_KEY',
        },
      })
      .build();

    // Just log the client info - not actually using it for operations
    console.log('Production client tableName:', productionClient.getTableName());

    // Example 2: Client with custom endpoint (e.g., DynamoDB Local or AWS Local)
    console.log('\nExample 2: Custom endpoint configuration');
    const localClient = new ClientBuilder()
      .withRegion('local')
      .withTableName('Users-Dev')
      .withEndpoint('http://localhost:8000')
      .withClientOptions({
        credentials: {
          accessKeyId: 'local',
          secretAccessKey: 'local',
        },
      })
      .build();

    console.log('Local development client tableName:', localClient.getTableName());
  } catch (error) {
    console.error('Error in main:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the example
console.log('Starting builder example...');
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
