import { ClientBuilder } from '../src/core/client-builder';
import { UpdateBuilder } from '../src/operations/update-builder';

// Example user interface 
interface User {
  userId: string;
  email: string;
  name: string;
  age: number;
  interests: string[];
  createdAt: string;
}

// Initialize DyndbClient for local development using the builder pattern
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
  .withConsistentRead(false)
  .build();

console.log('Initialized DyndbClient');

// Main function to demonstrate CRUD operations
async function main() {
  try {
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
    const readResult = await db.read(
      {
        userId: 'user123',
        email: 'john@example.com',
      },
      {
        consistentRead: true,
      }
    );
    if (!readResult.success) {
      console.error('Read operation failed:', readResult.error);
      throw new Error(`Failed to read user: ${readResult.error?.message}`);
    }
    console.log('Read result:', readResult);

    // Update the user using the UpdateBuilder
    console.log('\nUpdating user...');
    const updateBuilder = new UpdateBuilder();
    const updates = updateBuilder
      .set('age', 31)
      .set('interests', ['coding', 'reading', 'gaming'])
      .build();

    const updateResult = await db.update(
      {
        userId: 'user123',
        email: 'john@example.com',
      },
      updates,
      {
        returnValues: 'ALL_NEW',
        conditionExpression: 'attribute_exists(userId) AND attribute_exists(email)',
      }
    );
    if (!updateResult.success) {
      console.error('Update operation failed:', updateResult.error);
      throw new Error(`Failed to update user: ${updateResult.error?.message}`);
    }
    console.log('Update result:', updateResult);

    // Query users using the query() method on the client
    console.log('\nQuerying users...');
    const queryResult = await db.executeQuery({
      keyCondition: {
        expression: 'userId = :userId',
        values: { ':userId': 'user123' },
      },
      consistentRead: true,
    });
    if (!queryResult.success) {
      console.error('Query operation failed:', queryResult.error);
      throw new Error(`Failed to query users: ${queryResult.error?.message}`);
    }
    console.log('Query result:', queryResult);

    // Scan the table
    console.log('\nScanning table...');
    const scanBuilder = db.scan().greaterThan('age', 25).withLimit(10);

    const scanResult = await db.executeScan(scanBuilder.build());
    if (!scanResult.success) {
      console.error('Scan operation failed:', scanResult.error);
      throw new Error(`Failed to scan table: ${scanResult.error?.message}`);
    }
    console.log('Scan result:', scanResult);

    // Delete the user
    console.log('\nDeleting user...');
    const deleteResult = await db.delete(
      {
        userId: 'user123',
        email: 'john@example.com',
      },
      {
        returnValues: 'ALL_OLD',
        conditionExpression: 'attribute_exists(userId) AND attribute_exists(email)',
      }
    );
    if (!deleteResult.success) {
      console.error('Delete operation failed:', deleteResult.error);
      throw new Error(`Failed to delete user: ${deleteResult.error?.message}`);
    }
    console.log('Delete result:', deleteResult);
  } catch (error) {
    console.error('Error in main:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the example
console.log('Starting example...');
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
