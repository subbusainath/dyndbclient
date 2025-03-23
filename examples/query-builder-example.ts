import { ClientBuilder } from '../src/core/client-builder';
import { QueryBuilder } from '../src/operations/query-builder';

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

    // Delete existing users to start fresh
    console.log('\nDeleting any existing users...');
    const userIds = ['user1', 'user2', 'user3'];
    for (const userId of userIds) {
      try {
        await db.delete({ userId });
        console.log(`Deleted user ${userId} if it existed`);
      } catch (error) {
        // Ignore any errors when deleting non-existent users
        console.log(`No user ${userId} to delete or error occurred`);
      }
    }

    // Create some test users
    const users: User[] = [
      {
        userId: 'user1',
        email: 'john@example.com',
        name: 'John Doe',
        age: 30,
        interests: ['coding', 'reading'],
        createdAt: new Date().toISOString(),
      },
      {
        userId: 'user2',
        email: 'jane@example.com',
        name: 'Jane Smith',
        age: 25,
        interests: ['gaming', 'music'],
        createdAt: new Date().toISOString(),
      },
      {
        userId: 'user3',
        email: 'bob@example.com',
        name: 'Bob Johnson',
        age: 35,
        interests: ['coding', 'gaming'],
        createdAt: new Date().toISOString(),
      },
    ];

    // Create or update users
    console.log('\nCreating or updating test users...');
    for (const user of users) {
      // First check if the user exists
      const existingUser = await db.read({ userId: user.userId });

      if (existingUser.success && existingUser.data) {
        console.log(`User ${user.userId} already exists, skipping creation`);
        continue;
      }

      // Create the user if it doesn't exist
      try {
        const createResult = await db.create(user);

        if (createResult.success) {
          console.log(`Created user ${user.userId}`);
        } else {
          console.error(`Failed to create user ${user.userId}:`, createResult.error);
        }
      } catch (error) {
        console.error(`Error creating user ${user.userId}:`, error);
      }
    }

    // Query users using the QueryBuilder
    console.log('\nQuerying users with multiple conditions...');
    const queryBuilder = new QueryBuilder();
    const queryParams = queryBuilder
      .equals('userId', 'user1')
      .greaterThan('age', 25)
      .selectFields(['userId', 'name', 'age', 'interests'])
      .withLimit(10)
      .build();

    const queryResult = await db.executeQuery({
      ...queryParams,
      consistentRead: true,
    });

    if (!queryResult.success) {
      console.error('Query operation failed:', queryResult.error);
      throw new Error(`Failed to query users: ${queryResult.error?.message}`);
    }
    console.log('Query result:', queryResult);

    // Query using an index
    console.log('\nQuerying users using an index...');
    const indexQueryBuilder = new QueryBuilder();
    const indexQueryParams = indexQueryBuilder
      .usingIndex('EmailIndex')
      .equals('email', 'john@example.com')
      .selectFields(['userId', 'email', 'name'])
      .build();

    const indexQueryResult = await db.executeQuery({
      ...indexQueryParams,
      consistentRead: false,
    });

    if (!indexQueryResult.success) {
      console.error('Index query operation failed:', indexQueryResult.error);
      throw new Error(`Failed to query users by index: ${indexQueryResult.error?.message}`);
    }
    console.log('Index query result:', indexQueryResult);
  } catch (error) {
    console.error('Error in main:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the example
console.log('Starting query builder example...');
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
