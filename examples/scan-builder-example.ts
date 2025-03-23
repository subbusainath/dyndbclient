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

    // Basic scan using the ScanBuilder
    console.log('\nPerforming a basic scan with ScanBuilder...');
    const scanBuilder = db.scan();
    // The ScanBuilder automatically handles reserved keywords internally
    // when we use its methods, so we don't need to explicitly handle 'name'
    const scanParams = scanBuilder
      .greaterThan('age', 25)
      .selectFields(['userId', 'name', 'age', 'interests'])
      .withLimit(10)
      .build();

    const scanResult = await db.executeScan(scanParams);
    if (!scanResult.success) {
      console.error('Scan operation failed:', scanResult.error);
      throw new Error(`Failed to scan users: ${scanResult.error?.message}`);
    }
    console.log('Basic scan result:', scanResult.data);

    // Scan with multiple conditions
    console.log('\nPerforming a scan with multiple conditions...');
    const advancedScanBuilder = db.scan();
    const advancedScanParams = advancedScanBuilder
      .greaterThan('age', 20)
      .lessThan('age', 40)
      .contains('interests', 'coding')
      .build();

    const advancedScanResult = await db.executeScan(advancedScanParams);
    if (!advancedScanResult.success) {
      console.error('Advanced scan operation failed:', advancedScanResult.error);
      throw new Error(`Failed to scan users: ${advancedScanResult.error?.message}`);
    }
    console.log('Advanced scan result:', advancedScanResult.data);

    // Scan with a secondary index
    console.log('\nPerforming a scan on a secondary index...');
    const indexScanBuilder = db.scan();
    const indexScanParams = indexScanBuilder
      .usingIndex('EmailIndex')
      .beginsWith('email', 'j')
      .build();

    const indexScanResult = await db.executeScan(indexScanParams);
    if (!indexScanResult.success) {
      console.error('Index scan operation failed:', indexScanResult.error);
      throw new Error(`Failed to scan users by index: ${indexScanResult.error?.message}`);
    }
    console.log('Index scan result:', indexScanResult.data);

    // Parallel scan example
    console.log('\nPerforming a parallel scan (segment 0 of 2)...');
    const parallelScanBuilder = db.scan();
    const parallelScanParams = parallelScanBuilder
      .withParallelScan(2, 0) // 2 total segments, this is segment 0
      .attributeExists('userId')
      .build();

    const parallelScanResult = await db.executeScan(parallelScanParams);
    if (!parallelScanResult.success) {
      console.error('Parallel scan operation failed:', parallelScanResult.error);
      throw new Error(`Failed to parallel scan users: ${parallelScanResult.error?.message}`);
    }
    console.log('Parallel scan result (segment 0):', parallelScanResult.data);
  } catch (error) {
    console.error('Error in main:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run the example
console.log('Starting scan builder example...');
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
