# DyndbClient

A simplified and type-safe wrapper around AWS DynamoDB client that makes working with DynamoDB easier and more intuitive, supporting both JavaScript and TypeScript.

[![NPM version](https://img.shields.io/npm/v/dyndbclient.svg)](https://www.npmjs.com/package/dyndbclient)
[![License](https://img.shields.io/npm/l/dyndbclient.svg)](https://github.com/subbusainath/dyndbclient/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14.0.0+-green.svg)](https://nodejs.org/)

## Features

- Simple and intuitive API for DynamoDB operations
- Full TypeScript support with comprehensive type definitions
- Works smoothly with both JavaScript and TypeScript projects
- Support for all DynamoDB operations
- Batch operations support
- Transaction support
- Builder pattern for Query, Update, and Scan operations
- DynamoDB Stream support
- Automatic retries and error handling
- Comprehensive documentation and examples

## Installation

```bash
npm install dyndbclient
```

## Using with TypeScript

DyndbClient is written in TypeScript with full type definitions. TypeScript users get the benefits of:

- Type checking for all operations
- Auto-completion in compatible editors
- Type inference for retrieved items
- Documentation through types

## Using with JavaScript

JavaScript users can use DyndbClient without any additional setup. The package works out of the box in JavaScript projects with the same API. You'll just miss some of the type safety that TypeScript provides.

## Quick Start

### TypeScript Example

```typescript
import { DyndbClient } from 'dyndbclient';

// Define your item type (optional but recommended in TypeScript)
interface User {
  userId: string;
  name: string;
  email: string;
  age: number;
}

// Initialize the client with type
const db = new DyndbClient<User>({
  region: 'us-east-1',
  tableName: 'Users'
});

// Create a user - type checking ensures correct properties
const createResult = await db.create({
  userId: '123',
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// Read a user - returns with proper typing
const user = await db.read({ userId: '123' });
console.log(user.item.name); // TypeScript knows this is a string
```

### JavaScript Example

```javascript
const { DyndbClient } = require('dyndbclient');

// Initialize the client
const db = new DyndbClient({
  region: 'us-east-1',
  tableName: 'Users'
});

// Create a user
const createResult = await db.create({
  userId: '123',
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});

// Read a user
const user = await db.read({ userId: '123' });
console.log(user.item.name);
```

## Core Operations

### Initialize Client

You can initialize the DyndbClient in two ways:

#### 1. Using the Constructor

```typescript
// Initialize with default AWS credentials
const db = new DyndbClient({
  region: 'us-east-1',
  tableName: 'Users'
});

// Initialize with explicit credentials
const dbWithCreds = new DyndbClient({
  region: 'us-east-1',
  tableName: 'Users',
  clientOptions: {
    credentials: {
      accessKeyId: 'YOUR_ACCESS_KEY',
      secretAccessKey: 'YOUR_SECRET_KEY'
    }
  }
});

// Initialize with a specific AWS profile
const dbWithProfile = new DyndbClient({
  region: 'us-east-1',
  tableName: 'Users',
  clientOptions: {
    profile: 'my-profile-name'
  }
});

// Local development with DynamoDB local
const localDb = new DyndbClient({
  region: 'local',
  tableName: 'Users',
  endpoint: 'http://localhost:8000'
});
```

#### 2. Using the ClientBuilder (Fluent API)

The ClientBuilder provides a fluent interface for configuring and creating a DyndbClient instance:

```typescript
import { ClientBuilder } from 'dyndbclient';

// Create a client using builder pattern
const db = new ClientBuilder()
  .withRegion('us-east-1')
  .withTableName('Users')
  .withMaxRetries(5)
  .withTimeout(10000)
  .withConsistentRead(true)
  .build();

// For local development
const localDb = new ClientBuilder()
  .withRegion('local')
  .withTableName('Users')
  .withEndpoint('http://localhost:8000')
  .build();

// With explicit credentials
const dbWithCreds = new ClientBuilder()
  .withRegion('us-east-1')
  .withTableName('Users')
  .withClientOptions({
    credentials: {
      accessKeyId: 'YOUR_ACCESS_KEY',
      secretAccessKey: 'YOUR_SECRET_KEY'
    }
  })
  .build();

// With AWS profile
const dbWithProfile = new ClientBuilder()
  .withRegion('us-east-1')
  .withTableName('Users')
  .withClientOptions({
    profile: 'development'
  })
  .build();
```

### Create Item

```typescript
const result = await db.create({
  userId: '123',
  name: 'John Doe',
  email: 'john@example.com',
  age: 30
});
```

### Read Item

```typescript
// Simple primary key
const result = await db.read({
  userId: '123'
});

// Composite key (partition key + sort key)
const compositeResult = await db.read({
  userId: '123',
  timestamp: 1622505600000
});

// With consistent read
const consistentResult = await db.read(
  { userId: '123' },
  { consistentRead: true }
);
```

### Update Item

```typescript
// Update with individual field operations
const result = await db.update(
  { userId: '123' },
  [
    { field: 'name', value: 'John Smith', operation: 'SET' },
    { field: 'age', value: 1, operation: 'ADD' },
    { field: 'tags', value: ['active'], operation: 'APPEND' }
  ]
);

// Using update expression directly
const expressionResult = await db.update(
  { userId: '123' },
  {
    updateExpression: 'SET #name = :name, #age = #age + :increment',
    expressionAttributeNames: {
      '#name': 'name',
      '#age': 'age'
    },
    expressionAttributeValues: {
      ':name': 'John Smith',
      ':increment': 1
    }
  }
);
```

### Delete Item

```typescript
const result = await db.delete({
  userId: '123'
});

// With condition
const conditionalResult = await db.delete(
  { userId: '123' },
  {
    conditionExpression: 'attribute_exists(userId) AND age > :minAge',
    expressionAttributeValues: { ':minAge': 18 }
  }
);
```

### Query

```typescript
// Basic query
const result = await db.query({
  keyCondition: {
    expression: 'userId = :userId',
    values: { ':userId': '123' }
  }
});

// Query with index
const indexResult = await db.query({
  indexName: 'EmailIndex',
  keyCondition: {
    expression: 'email = :email',
    values: { ':email': 'john@example.com' }
  }
});

// With filter
const filteredResult = await db.query({
  keyCondition: {
    expression: 'userId = :userId',
    values: { ':userId': '123' }
  },
  filter: {
    expression: 'age > :age',
    values: { ':age': 18 }
  }
});
```

### Scan

```typescript
// Basic scan
const result = await db.scan();

// Scan with filter
const filteredResult = await db.scan({
  filter: {
    expression: 'age > :age',
    values: { ':age': 18 }
  }
});

// Using scan builder
const builder = db.scanBuilder()
  .filterAttribute('age').greaterThan(18)
  .filterAttribute('status').equals('active')
  .limit(50);

const builderResult = await builder.execute();
```

## Advanced Operations

### Batch Operations

```typescript
// Batch get
const batchGetResult = await db.batchGet([
  {
    tableName: 'Users',
    keys: [
      { userId: '123' },
      { userId: '456' }
    ]
  }
]);

// Batch write
const batchWriteResult = await db.batchWrite([
  {
    tableName: 'Users',
    items: [
      {
        PutRequest: {
          Item: {
            userId: '123',
            name: 'John Doe'
          }
        }
      },
      {
        DeleteRequest: {
          Key: {
            userId: '456'
          }
        }
      }
    ]
  }
]);
```

### Transactions

```typescript
const transactionResult = await db.executeTransaction([
  {
    type: 'Put',
    tableName: 'Users',
    item: {
      userId: '123',
      name: 'John Doe'
    },
    condition: 'attribute_not_exists(userId)'
  },
  {
    type: 'Update',
    tableName: 'Counters',
    key: { counterId: 'users' },
    updateExpression: 'SET #count = #count + :inc',
    expressionAttributeNames: { '#count': 'count' },
    expressionAttributeValues: { ':inc': 1 }
  }
]);
```

### DynamoDB Streams

```typescript
// Set up a stream processor
const streamProcessor = db.createStreamHandler({
  streamArn: 'YOUR_STREAM_ARN',
  iteratorType: 'LATEST',
  batchSize: 100,
  startingPosition: 'LATEST'
});

// Process records with a callback
streamProcessor.process(async (records) => {
  for (const record of records) {
    console.log('Operation:', record.eventName);
    console.log('New image:', record.newImage);
    console.log('Old image:', record.oldImage);
    
    // Custom processing here
    if (record.eventName === 'INSERT') {
      await processNewUser(record.newImage);
    }
  }
});

// Start processing
await streamProcessor.start();

// Later, stop processing
await streamProcessor.stop();
```

## Configuration Options

The `DyndbClient` constructor accepts a `ClientConfig` object with these properties:

```typescript
interface ClientConfig {
  /**
   * AWS region where the DynamoDB table is located
   */
  region: string;
  
  /**
   * Name of the DynamoDB table
   */
  tableName: string;
  
  /**
   * Optional DynamoDB endpoint URL (useful for local development)
   */
  endpoint?: string;
  
  /**
   * Optional AWS SDK v3 DynamoDBClient configuration
   */
  clientOptions?: Partial<DynamoDBClientConfig>;
  
  /**
   * Maximum number of retries for failed operations
   * @default 3
   */
  maxRetries?: number;
  
  /**
   * Timeout in milliseconds for operations
   * @default 5000
   */
  timeout?: number;
  
  /**
   * Whether to use consistent reads by default
   * @default false
   */
  consistentRead?: boolean;
}
```

## Authentication Methods

The client supports multiple authentication methods:

1. **Default AWS Credential Provider Chain** (recommended)
   ```typescript
   const db = new DyndbClient({
     region: 'us-east-1',
     tableName: 'Users'
   });
   ```

2. **Specific AWS Profile**
   ```typescript
   const db = new DyndbClient({
     region: 'us-east-1',
     tableName: 'Users',
     clientOptions: {
       profile: 'development'
     }
   });
   ```

3. **Explicit Credentials**
   ```typescript
   const db = new DyndbClient({
     region: 'us-east-1',
     tableName: 'Users',
     clientOptions: {
       credentials: {
         accessKeyId: 'YOUR_ACCESS_KEY',
         secretAccessKey: 'YOUR_SECRET_KEY'
       }
     }
   });
   ```

## Error Handling

The client includes advanced error handling:

```typescript
try {
  const result = await db.read({ userId: 'non-existent-id' });
} catch (error) {
  if (error.name === 'ResourceNotFoundException') {
    console.log('Item not found!');
  } else if (error.name === 'ProvisionedThroughputExceededException') {
    console.log('Rate limit exceeded, consider retrying with backoff');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Local Development

You can use DyndbClient with local DynamoDB for development:

```typescript
// Using with DynamoDB Local
const db = new DyndbClient({
  region: 'local',
  tableName: 'Users',
  endpoint: 'http://localhost:8000'
});

// Using with Docker
// First run: docker run -p 8000:8000 amazon/dynamodb-local
const dockerDb = new DyndbClient({
  region: 'local',
  tableName: 'Users',
  endpoint: 'http://localhost:8000'
});
```

## Builder Patterns

### Using ClientBuilder

The ClientBuilder provides a fluent API for creating a DyndbClient instance with clear, chainable methods:

```typescript
import { ClientBuilder } from 'dyndbclient';

// Example with all configuration options
const db = new ClientBuilder()
  .withRegion('us-east-1')                // Set AWS region
  .withTableName('Users')                 // Set table name
  .withEndpoint('http://localhost:8000')  // Optional: for local development
  .withMaxRetries(5)                      // Optional: customize retry behavior
  .withTimeout(10000)                     // Optional: set operation timeout
  .withConsistentRead(true)               // Optional: enable consistent reads
  .withClientOptions({                    // Optional: AWS SDK client options
    credentials: {
      accessKeyId: 'YOUR_ACCESS_KEY',
      secretAccessKey: 'YOUR_SECRET_KEY'
    }
  })
  .build();                               // Create the client instance
```

This approach offers several advantages:
- Clear, readable configuration with meaningful method names
- Better IDE auto-completion and type safety
- Progressive configuration without complex option objects
- More intuitive for developers new to the library

### Using QueryBuilder

The QueryBuilder provides a fluent interface for building complex DynamoDB query operations with a clean, chainable API:

```typescript
// Create a query builder
const queryBuilder = db.query();

// Build a query with various conditions
const params = queryBuilder
  .withKeyCondition('userId = :userId')
  .withExpressionValue(':userId', '123')
  .usingIndex('EmailIndex')
  .withFilterExpression('age > :minAge')
  .withExpressionValue(':minAge', 21)
  // All attributes with reserved keywords are handled automatically
  .withProjection(['userId', 'name', 'email', 'age'])
  .withLimit(10)
  .withScanIndexForward(false) // descending order
  .build();

// Execute the query
const result = await db.executeQuery(params);
```

The QueryBuilder automatically:
- Handles reserved keywords in attribute names
- Organizes complex query conditions
- Provides type checking for required parameters
- Simplifies query construction with intuitive method names

### Using UpdateBuilder

The UpdateBuilder simplifies constructing complex update expressions for DynamoDB items:

```typescript
// Create an update builder
const updateBuilder = db.update();

// Build complex update operations
const params = updateBuilder
  .withKey({ userId: '123' })
  // Set operations
  .set('name', 'John Smith')
  .set('status', 'active')
  .set('lastUpdated', new Date().toISOString())
  // Math operations
  .increment('loginCount', 1)
  .increment('points', 100)
  // List operations
  .appendToList('tags', ['premium', 'verified'])
  .removeFromList('oldRoles', ['trial'])
  // Conditional updates
  .withCondition('attribute_exists(userId)')
  .build();

// Execute the update
const result = await db.executeUpdate(params);
```

Key features of UpdateBuilder:
- Simplifies complex update expressions
- Handles different operation types (SET, ADD, REMOVE, etc.)
- Manages expression attribute names for reserved keywords
- Provides a clear and intuitive API for updating items

### Using ScanBuilder

The ScanBuilder provides a fluent interface for creating scan operations and automatically handles DynamoDB's reserved keywords:

```typescript
// Create a scan builder
const scanBuilder = db.scan();

// Build complex scan parameters
const params = scanBuilder
  .greaterThan('age', 25)
  .contains('interests', 'coding')
  // Reserved keywords like 'name' are automatically handled
  .selectFields(['userId', 'name', 'age', 'interests'])
  .withLimit(20)
  .build();

// Execute the scan
const result = await db.executeScan(params);
```

All methods in the ScanBuilder (including `selectFields`) automatically handle reserved keywords by:
1. Detecting if a field name is a reserved word
2. Creating the necessary expression attribute names (#name)
3. Using the correct references in expressions

This makes it safe to use field names like 'name', 'key', 'timestamp', etc. without worrying about DynamoDB reserved keyword errors.

## Contributing

We welcome contributions to DyndbClient! Please check out our [Contributing Guide](CONTRIBUTING.md) for guidelines about how to proceed.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

All PRs will be tested with our automated GitHub Actions workflows before merging.

## NPM Package

DyndbClient is available as an NPM package. For information on publishing or updating the package, see our [NPM Publishing Guide](NPM_PUBLISHING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
