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

    // Create a test user
    const user: User = {
      userId: 'user1',
      email: 'john@example.com',
      name: 'John Doe',
      age: 30,
      interests: ['coding', 'reading'],
      createdAt: new Date().toISOString(),
    };

    // Create user
    console.log('\nCreating test user...');
    const createResult = await db.create(user, {
      conditionExpression: 'attribute_not_exists(userId) AND attribute_not_exists(email)',
      returnValues: 'NONE',
    });

    if (!createResult.success) {
      console.error(`Failed to create user:`, createResult.error);
      throw new Error(`Failed to create user: ${createResult.error?.message}`);
    }

    // Update user using the UpdateBuilder
    console.log('\nUpdating user with multiple operations...');
    const updateBuilder = new UpdateBuilder();
    const updates = updateBuilder
      .set('name', 'John Smith') // Set a string
      .increment('age', 1) // Increment a number
      .set('interests', ['coding', 'reading', 'gaming']) // Replace an array
      .build();

    const updateResult = await db.update({ userId: 'user1', email: 'john@example.com' }, updates, {
      returnValues: 'ALL_NEW',
      conditionExpression: 'attribute_exists(userId) AND attribute_exists(email)',
    });

    if (!updateResult.success) {
      console.error('Update operation failed:', updateResult.error);
      throw new Error(`Failed to update user: ${updateResult.error?.message}`);
    }

    console.log('Update result:', updateResult);
  } catch (error) {
    console.error('Error in main:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the example
console.log('Starting update builder example...');
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
