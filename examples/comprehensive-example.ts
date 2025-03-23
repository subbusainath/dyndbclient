import { ClientBuilder } from '../src/core/client-builder';
import { UpdateBuilder } from '../src/operations/update-builder';
import { QueryBuilder } from '../src/operations/query-builder';
import { TransactionOperationType } from '../src/operations/transaction';

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
      .withConsistentRead(true)
      .build();

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

    // Create users
    console.log('\nCreating test users...');
    for (const user of users) {
      const createResult = await db.create(user, {
        conditionExpression: 'attribute_not_exists(userId) AND attribute_not_exists(email)',
        returnValues: 'NONE',
      });
      if (!createResult.success) {
        console.error(`Failed to create user ${user.userId}:`, createResult.error);
        throw new Error(`Failed to create user: ${createResult.error?.message}`);
      }
    }

    // Update user using the UpdateBuilder
    console.log('\nUpdating user with multiple operations...');
    const updateBuilder = new UpdateBuilder();

    // Using the fixed UpdateBuilder methods
    const updates = updateBuilder
      .set('name', 'John Smith')
      .increment('age', 1)
      .appendToList('interests', 'gaming') // Now uses SET with list_append
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
      select: queryParams.select,
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
      .build();

    const indexQueryResult = await db.executeQuery({
      ...indexQueryParams,
      consistentRead: false,
      select: ['userId', 'email', 'name'],
    });

    if (!indexQueryResult.success) {
      console.error('Index query operation failed:', indexQueryResult.error);
      throw new Error(`Failed to query users by index: ${indexQueryResult.error?.message}`);
    }
    console.log('Index query result:', indexQueryResult);

    // Batch operations
    console.log('\nPerforming batch operations...');
    const batchGetResult = await db.batchGet([
      {
        tableName: 'Users',
        keys: [
          { userId: 'user1', email: 'john@example.com' },
          { userId: 'user2', email: 'jane@example.com' },
        ],
      },
    ]);

    if (!batchGetResult.success) {
      console.error('Batch get operation failed:', batchGetResult.error);
      throw new Error(`Failed to batch get users: ${batchGetResult.error?.message}`);
    }
    console.log('Batch get result:', batchGetResult);

    // Transaction operations
    console.log('\nPerforming transaction operations...');
    const transactionResult = await db.executeTransaction([
      {
        type: TransactionOperationType.Put,
        key: { userId: 'user4', email: 'alice@example.com' },
        item: {
          userId: 'user4',
          email: 'alice@example.com',
          name: 'Alice Brown',
          age: 28,
          interests: ['art', 'music'],
          createdAt: new Date().toISOString(),
        },
        condition: 'attribute_not_exists(userId) AND attribute_not_exists(email)',
      },
      {
        type: TransactionOperationType.Update,
        key: { userId: 'user1', email: 'john@example.com' },
        updateExpression: 'SET #name = :name',
        expressionValues: { ':name': 'John Smith Jr.' },
        expressionNames: { '#name': 'name' },
        condition: 'attribute_exists(userId)',
      },
    ]);

    if (!transactionResult.success) {
      console.error('Transaction operation failed:', transactionResult.error);
      throw new Error(`Failed to execute transaction: ${transactionResult.error?.message}`);
    }
    console.log('Transaction result:', transactionResult);
  } catch (error) {
    console.error('Error in main:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the example
console.log('Starting comprehensive example...');
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
