/**
 * DyndbClient - JavaScript Example
 * 
 * This example demonstrates how to use the DyndbClient library in a JavaScript project.
 */

// Import the client from the package
// In your real project, this would be: const { DyndbClient } = require('dyndbclient');
const { DyndbClient } = require('../dist');

// Initialize the client
const db = new DyndbClient({
  region: 'us-east-1',  // Use your actual AWS region
  tableName: 'users',   // Use your actual table name

  // For local development with DynamoDB local
  // endpoint: 'http://localhost:8000',
  // region: 'local',

  // Optional configurations
  // maxRetries: 3,
  // timeout: 5000,
  // consistentRead: false
});

// Define a user object
const user = {
  userId: '123',
  name: 'John Doe',
  email: 'john@example.com',
  age: 30,
  active: true,
  settings: {
    notifications: true,
    theme: 'dark'
  },
  tags: ['customer', 'premium']
};

/**
 * Example operations with async/await
 */
async function runExamples() {
  try {
    console.log('Starting JavaScript examples...');

    // Create a user
    console.log('Creating user...');
    const createResult = await db.create(user);
    console.log('Create result:', createResult);

    // Read the user
    console.log('Reading user...');
    const readResult = await db.read({ userId: '123' });
    console.log('Read result:', readResult);

    // Update the user
    console.log('Updating user...');
    const updateResult = await db.update(
      { userId: '123' },
      [
        { field: 'name', value: 'John Smith', operation: 'SET' },
        { field: 'age', value: 1, operation: 'ADD' },
        { field: 'tags', value: ['active'], operation: 'APPEND' }
      ]
    );
    console.log('Update result:', updateResult);

    // Query users
    console.log('Querying users...');
    const queryResult = await db.query({
      keyCondition: {
        expression: 'userId = :userId',
        values: { ':userId': '123' }
      }
    });
    console.log('Query result:', queryResult);

    // Scan users
    console.log('Scanning users...');
    const scanResult = await db.scan({
      filter: {
        expression: 'age > :age',
        values: { ':age': 20 }
      }
    });
    console.log('Scan result:', scanResult);

    // Delete the user
    console.log('Deleting user...');
    const deleteResult = await db.delete({ userId: '123' });
    console.log('Delete result:', deleteResult);

    console.log('All examples completed successfully!');
  } catch (error) {
    console.error('Error in examples:', error);
  }
}

// Run all the examples
runExamples();

/**
 * Alternative: Using promises with .then() chains
 * Uncomment to use this style instead of async/await
 */
/*
// Create a user
db.create(user)
  .then(createResult => {
    console.log('Create result:', createResult);
    return db.read({ userId: '123' });
  })
  .then(readResult => {
    console.log('Read result:', readResult);
    return db.update(
      { userId: '123' },
      [
        { field: 'name', value: 'John Smith', operation: 'SET' },
        { field: 'age', value: 1, operation: 'ADD' }
      ]
    );
  })
  .then(updateResult => {
    console.log('Update result:', updateResult);
    return db.delete({ userId: '123' });
  })
  .then(deleteResult => {
    console.log('Delete result:', deleteResult);
    console.log('All examples completed successfully!');
  })
  .catch(error => {
    console.error('Error in examples:', error);
  });
*/ 