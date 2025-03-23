import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
// Need to install: npm install @aws-sdk/client-dynamodb-streams
import { DynamoDBStreamsClient } from '@aws-sdk/client-dynamodb-streams';
import { DynamoDBDocumentClient, BatchGetCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import {
  ClientConfig,
  OperationResponse,
  BatchGetOptions,
  BatchWriteOptions,
  ScanOptions as ClientScanOptions,
  UpdateOptions as ClientUpdateOptions,
  DeleteOptions as ClientDeleteOptions,
  PutOptions,
  ConsumedCapacityResponse,
} from '../types';
import { handleError } from './error-handler';
import { QueryParams, queryTable } from '../operations/query';
import { TransactionItem, executeTransaction, transactionGet } from '../operations/transaction';
import { UpdateBuilder, FieldUpdate, updateItem, UpdateOptions } from '../operations/update';
import { createItem, CreateOptions } from '../operations/create';
import { readItem } from '../operations/read';
import { deleteItem, DeleteOptions } from '../operations/delete';
import { scanTable, ScanOptions } from '../operations/scan';
import { QueryBuilder } from '../operations/query-builder';
import { ScanBuilder } from '../operations/scan-builder';
import {
  getTableStreamArn,
  describeStream,
  getShardIterator,
  getStreamRecords,
  processStream,
  StreamHandler,
  StreamOptions,
  StreamProcessingConfig,
  ShardIteratorType,
} from '../operations/stream';
/**
 * DyndbClient - A simplified interface for DynamoDB operations
 *
 * This class provides a user-friendly wrapper around the AWS DynamoDB client,
 * offering simplified methods for common database operations while maintaining
 * type safety and error handling.
 *
 * Uses the newer @aws-sdk v3 packages for better TypeScript support and modularity.
 *
 * The client automatically uses AWS credentials from the default credential provider chain
 * if no explicit credentials are provided. This includes checking environment variables,
 * the shared credentials file (~/.aws/credentials), and EC2/ECS instance credentials.
 *
 * @example
 * // Initialize the client with explicit credentials
 * const db = new DyndbClient({
 *   region: 'us-east-1',
 *   tableName: 'Users',
 *   endpoint: 'http://localhost:8000', // Optional for local development
 *   clientOptions: {
 *     credentials: {
 *       accessKeyId: 'YOUR_ACCESS_KEY',
 *       secretAccessKey: 'YOUR_SECRET_KEY'
 *     }
 *   },
 *   consistentRead: false
 * });
 *
 * // Initialize the client using AWS CLI profile credentials (recommended)
 * // This will automatically use credentials from ~/.aws/credentials or environment variables
 * const dbWithProfileCreds = new DyndbClient({
 *   region: 'us-east-1',
 *   tableName: 'Users'
 *   // No need to specify credentials - uses AWS credential provider chain
 * });
 *
 * // Initialize with a specific AWS CLI profile
 * const dbWithNamedProfile = new DyndbClient({
 *   region: 'us-east-1',
 *   tableName: 'Users',
 *   clientOptions: {
 *     profile: 'my-profile-name'  // Uses credentials from specific profile in ~/.aws/credentials
 *   }
 * });
 */
export class DyndbClient {
  private client: DynamoDBDocumentClient;
  private readonly tableName: string;
  private readonly consistentRead: boolean;

  /**
   * Creates a new instance of DyndbClient
   * @param config - Configuration options for the DynamoDB client
   *
   * @example
   * // For production use with explicit credentials
   * const client = new DyndbClient({
   *   region: 'us-east-1',
   *   tableName: 'Users',
   *   clientOptions: {
   *     credentials: {
   *       accessKeyId: 'YOUR_ACCESS_KEY',
   *       secretAccessKey: 'YOUR_SECRET_KEY'
   *     }
   *   }
   * });
   *
   * // For production use with AWS CLI credentials (recommended)
   * const client = new DyndbClient({
   *   region: 'us-east-1',
   *   tableName: 'Users'
   *   // Credentials will be loaded automatically from AWS CLI configuration
   * });
   *
   * // For local development with DynamoDB local
   * const localClient = new DyndbClient({
   *   region: 'local',
   *   tableName: 'Users',
   *   endpoint: 'http://localhost:8000',
   *   clientOptions: {
   *     credentials: {
   *       accessKeyId: 'local',
   *       secretAccessKey: 'local'
   *     }
   *   }
   * });
   */
  constructor(config: ClientConfig) {
    try {
      // Create the base DynamoDB client
      const baseClient = new DynamoDBClient({
        region: config.region,
        endpoint: config.endpoint,
        ...config.clientOptions,
      });

      // Create the DocumentClient with enhanced features
      this.client = DynamoDBDocumentClient.from(baseClient);
      this.tableName = config.tableName;

      // Set configuration defaults
      this.consistentRead = config.consistentRead || false;
    } catch (error) {
      handleError('Failed to initialize DynamoDB client', error);
    }
  }

  /**
   * Create a new query builder
   *
   * @returns A new QueryBuilder instance for fluent query construction
   *
   * @example
   * // Create a query builder for a simple primary key query
   * const queryBuilder = db.query()
   *   .equals('userId', '123')
   *   .selectFields(['userId', 'email', 'name'])
   *   .withLimit(10);
   *
   * // Create a query builder for a more complex query using GSI (Global Secondary Index)
   * const gsiQueryBuilder = db.query()
   *   .equals('email', 'john@example.com')    // Partition key for the GSI
   *   .usingIndex('EmailIndex')               // Specify the GSI to use
   *   .selectFields(['userId', 'name', 'email', 'createdAt'])
   *   .withLimit(10);
   *
   * // Create a query builder with range key conditions
   * const rangeKeyQueryBuilder = db.query()
   *   .equals('userId', '123')                // Partition key condition
   *   .beginsWith('status', 'ACTIVE')         // Range key condition with BEGINS_WITH
   *   .selectFields(['userId', 'status', 'updatedAt']);
   *
   * // Create a query builder with between condition for range key
   * const dateRangeQueryBuilder = db.query()
   *   .equals('userId', '123')                           // Partition key condition
   *   .between('createdAt', 1609459200000, 1640995200000) // Range key between two timestamps
   *   .selectFields(['userId', 'orderDate', 'amount']);
   *
   * // Execute any of these query builders with executeQuery method
   * const result = await db.executeQuery(queryBuilder.build());
   */
  query(): QueryBuilder {
    return new QueryBuilder();
  }

  /**
   * Create a new scan builder
   *
   * @returns A new ScanBuilder instance for fluent scan construction
   *
   * @example
   * // Create a scan builder and configure it
   * const scanBuilder = db.scan()
   *   .greaterThan('age', 25)
   *   .contains('interests', 'coding')
   *   .withLimit(20)
   *   .selectFields(['userId', 'name', 'age']);
   *
   * // Get the built scan parameters
   * const scanParams = scanBuilder.build();
   *
   * // Execute the scan
   * const result = await db.executeScan(scanParams);
   */
  scan(): ScanBuilder {
    return new ScanBuilder();
  }

  /**
   * Execute a query using the provided parameters
   *
   * @param options - Query parameters including key conditions, filters, and pagination options
   * @returns Promise resolving to an OperationResponse with query results
   *
   * @example
   * // Method 1: Execute a query using the QueryBuilder (recommended)
   * const queryParams = db.query()
   *   .equals('userId', '123')
   *   .selectFields(['userId', 'name', 'email'])
   *   .withLimit(10)
   *   .build();
   *
   * const result = await db.executeQuery(queryParams);
   *
   * // Method 2: Execute a query directly with parameter object
   * const result = await db.executeQuery({
   *   keyCondition: {
   *     expression: 'userId = :userId',
   *     values: { ':userId': '123' }
   *   }
   * });
   *
   * // Execute a more complex query with GSI and filter
   * // Using QueryBuilder (recommended for complex queries)
   * const queryParams = db.query()
   *   .equals('email', 'john@example.com')
   *   .usingIndex('EmailIndex')
   *   .selectFields(['userId', 'name', 'email', 'age'])
   *   .withLimit(20)
   *   .build();
   *
   * // Add filter for results (applied after query)
   * const result = await db.executeQuery({
   *   ...queryParams,
   *   filter: {
   *     expression: 'age > :minAge',
   *     values: { ':minAge': 18 }
   *   },
   *   consistentRead: true,
   *   scanIndexForward: false // Sort in descending order (newest first)
   * });
   *
   * // Paginate through results using lastEvaluatedKey
   * let lastEvaluatedKey;
   * let allItems = [];
   *
   * do {
   *   const queryParams = db.query()
   *     .equals('userId', '123')
   *     .selectFields(['userId', 'name', 'email'])
   *     .withLimit(100)
   *     .build();
   *
   *   const result = await db.executeQuery({
   *     ...queryParams,
   *     exclusiveStartKey: lastEvaluatedKey
   *   });
   *
   *   if (result.success) {
   *     allItems = [...allItems, ...result.data];
   *     lastEvaluatedKey = result.lastEvaluatedKey;
   *   } else {
   *     console.error('Query failed:', result.error);
   *     break;
   *   }
   * } while (lastEvaluatedKey);
   *
   * // Handle the response
   * if (result.success) {
   *   const items = result.data;
   *   const lastKey = result.lastEvaluatedKey; // For pagination
   *   const count = result.count;              // Number of items returned
   *   const scannedCount = result.scannedCount; // Number of items evaluated
   * } else {
   *   console.error('Query failed:', result.error);
   * }
   */
  async executeQuery(options: QueryParams): Promise<OperationResponse> {
    try {
      return await queryTable(this.client, this.tableName, options);
    } catch (error) {
      return handleError('Failed to execute query', error);
    }
  }

  /**
   * Execute a scan operation
   *
   * @param options - Scan parameters including filters and pagination options
   * @returns Promise resolving to an OperationResponse with scan results
   *
   * @example
   * // Execute a scan with filter
   * const result = await db.executeScan({
   *   filter: {
   *     expression: 'age > :minAge',
   *     values: { ':minAge': 21 }
   *   },
   *   limit: 50
   * });
   *
   * // Execute a scan using a scan builder
   * const scanParams = db.scan()
   *   .greaterThan('age', 25)
   *   .contains('interests', 'coding')
   *   .build();
   *
   * const result = await db.executeScan(scanParams);
   *
   * // Handle the response
   * if (result.success) {
   *   const items = result.data;
   *   const lastKey = result.lastEvaluatedKey; // For pagination
   * } else {
   *   console.error('Scan failed:', result.error);
   * }
   */
  async executeScan(options: ScanOptions): Promise<OperationResponse> {
    try {
      return await scanTable(this.client, this.tableName, options);
    } catch (error) {
      return handleError('Failed to execute scan', error);
    }
  }

  /**
   * Scan the table with the given options
   * @deprecated Use scan() builder and executeScan() instead for better type safety and flexibility
   *
   * @param options - Scan options
   * @returns Promise resolving to an OperationResponse with scan results
   *
   * @example
   * // Old way (deprecated)
   * const result = await db.scanTable({
   *   filterExpression: 'age > :minAge',
   *   expressionAttributeValues: { ':minAge': 21 }
   * });
   *
   * // New way (recommended)
   * const scanBuilder = db.scan()
   *   .greaterThan('age', 21)
   *   .build();
   *
   * const result = await db.executeScan(scanBuilder);
   */
  async scanTable(options: ClientScanOptions = {}): Promise<OperationResponse> {
    try {
      return await scanTable(this.client, this.tableName, options);
    } catch (error) {
      return handleError('Failed to scan table', error);
    }
  }

  /**
   * Create a new update builder
   *
   * @returns A new UpdateBuilder instance for fluent update operation construction
   *
   * @example
   * // Create an update builder for modifying an item
   * const updateBuilder = db.updateBuilder()
   *   .set('name', 'John Smith')
   *   .add('age', 1)
   *   .append('interests', ['hiking', 'photography'])
   *   .remove('temporaryField');
   *
   * // Get the built update operations
   * const updates = updateBuilder.build();
   *
   * // Apply the updates to an item
   * const result = await db.update(
   *   { userId: '123' },
   *   updates,
   *   { returnValues: 'ALL_NEW' }
   * );
   */
  updateBuilder(): UpdateBuilder {
    return new UpdateBuilder();
  }

  /**
   * Batch get items from multiple tables
   *
   * @param requests - Array of batch get requests with table names and keys
   * @param options - Optional settings for the batch get operation
   * @returns Promise resolving to an OperationResponse with retrieved items
   *
   * @example
   * // Fetch items from multiple tables
   * const result = await db.batchGet([
   *   {
   *     tableName: 'Users',
   *     keys: [
   *       { userId: '123' },
   *       { userId: '456' }
   *     ]
   *   },
   *   {
   *     tableName: 'Orders',
   *     keys: [
   *       { orderId: '789' }
   *     ]
   *   }
   * ], {
   *   consistentRead: true,
   *   returnConsumedCapacity: 'TOTAL'
   * });
   *
   * // Handle the response
   * if (result.success) {
   *   const users = result.data.Users;    // Array of User items
   *   const orders = result.data.Orders;  // Array of Order items
   *   const capacity = result.consumedCapacity; // Consumed capacity information
   * } else {
   *   console.error('Batch get failed:', result.error);
   * }
   */
  async batchGet(
    requests: { tableName: string; keys: Record<string, any>[] }[],
    options?: BatchGetOptions
  ): Promise<OperationResponse> {
    try {
      const command = new BatchGetCommand({
        RequestItems: requests.reduce(
          (acc, req) => ({
            ...acc,
            [req.tableName]: {
              Keys: req.keys,
              ConsistentRead: options?.consistentRead ?? this.consistentRead,
              ReturnConsumedCapacity: options?.returnConsumedCapacity,
            },
          }),
          {}
        ),
      });

      const response = await this.client.send(command);

      return {
        success: true,
        data: response.Responses,
        consumedCapacity: response.ConsumedCapacity as ConsumedCapacityResponse,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error : new Error('Unknown error during batch get operation'),
      };
    }
  }

  /**
   * Batch write items to multiple tables
   *
   * @param requests - Array of batch write requests with table names and items
   * @param options - Optional settings for the batch write operation
   * @returns Promise resolving to an OperationResponse with operation results
   *
   * @example
   * // Batch write operations (put and delete)
   * const result = await db.batchWrite([
   *   {
   *     tableName: 'Users',
   *     items: [
   *       {
   *         PutRequest: {
   *           Item: {
   *             userId: '123',
   *             name: 'John Doe',
   *             email: 'john@example.com'
   *           }
   *         }
   *       },
   *       {
   *         DeleteRequest: {
   *           Key: {
   *             userId: '456'
   *           }
   *         }
   *       }
   *     ]
   *   },
   *   {
   *     tableName: 'Orders',
   *     items: [
   *       {
   *         PutRequest: {
   *           Item: {
   *             orderId: '789',
   *             userId: '123',
   *             total: 99.99
   *           }
   *         }
   *       }
   *     ]
   *   }
   * ], {
   *   returnConsumedCapacity: 'TOTAL',
   *   returnItemCollectionMetrics: 'SIZE'
   * });
   *
   * // Handle the response
   * if (result.success) {
   *   console.log('Batch write successful');
   *   const capacity = result.consumedCapacity; // Consumed capacity information
   *
   *   // Handle any unprocessed items
   *   if (result.data.UnprocessedItems && Object.keys(result.data.UnprocessedItems).length > 0) {
   *     console.log('Some items were not processed:', result.data.UnprocessedItems);
   *   }
   * } else {
   *   console.error('Batch write failed:', result.error);
   * }
   */
  async batchWrite(
    requests: { tableName: string; items: any[] }[],
    options?: BatchWriteOptions
  ): Promise<OperationResponse> {
    try {
      const command = new BatchWriteCommand({
        RequestItems: requests.reduce(
          (acc, req) => ({
            ...acc,
            [req.tableName]: req.items,
          }),
          {}
        ),
        ReturnConsumedCapacity: options?.returnConsumedCapacity,
        ReturnItemCollectionMetrics: options?.returnItemCollectionMetrics,
      });

      const response = await this.client.send(command);

      return {
        success: true,
        data: response,
        consumedCapacity: response.ConsumedCapacity as ConsumedCapacityResponse,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error : new Error('Unknown error during batch write operation'),
      };
    }
  }

  /**
   * Returns the underlying DynamoDB document client
   * @returns DynamoDBDocumentClient
   */
  getClient(): DynamoDBDocumentClient {
    return this.client;
  }

  /**
   * Returns the configured table name
   * @returns string
   */
  getTableName(): string {
    return this.tableName;
  }

  /**
   * Execute a transaction with multiple operations
   *
   * @param operations - Array of transaction operations (put, update, delete, condition checks)
   * @returns Promise resolving to an OperationResponse with transaction results
   *
   * @example
   * // Import the required types from the library
   * import { DyndbClient, TransactionOperationType } from '@dyndb-client';
   *
   * // Initialize the client
   * const db = new DyndbClient({
   *   region: 'us-east-1',
   *   tableName: 'Users'
   *   // other options...
   * });
   *
   * // Execute a transaction with multiple operations
   * const result = await db.executeTransaction([
   *   // Put operation to create a new user
   *   {
   *     type: TransactionOperationType.Put,
   *     item: {
   *       userId: '123',
   *       name: 'John Doe',
   *       email: 'john@example.com',
   *       createdAt: new Date().toISOString()
   *     },
   *     // Only succeed if this user ID doesn't already exist
   *     condition: 'attribute_not_exists(userId)',
   *     // No expression values needed for this condition
   *   },
   *
   *   // Update operation to modify an existing user
   *   {
   *     type: TransactionOperationType.Update,
   *     key: { userId: '456' },
   *     updateExpression: 'SET #name = :name, #status = :status, updatedAt = :timestamp',
   *     expressionValues: {
   *       ':name': 'Jane Smith',
   *       ':status': 'VERIFIED',
   *       ':timestamp': new Date().toISOString()
   *     },
   *     expressionNames: {
   *       '#name': 'name',       // Using expression attribute names for reserved word
   *       '#status': 'status'    // Using expression attribute names for clarity
   *     },
   *     // Only update if the user exists and is not already verified
   *     condition: 'attribute_exists(userId) AND #status <> :verifiedStatus',
   *     // Additional expression values used in the condition
   *     expressionValues: {
   *       ':verifiedStatus': 'VERIFIED'
   *     }
   *   },
   *
   *   // Delete operation to remove a user
   *   {
   *     type: TransactionOperationType.Delete,
   *     key: { userId: '789' },
   *     // Only delete users that are in INACTIVE status
   *     condition: '#status = :inactiveStatus',
   *     expressionNames: {
   *       '#status': 'status'
   *     },
   *     expressionValues: {
   *       ':inactiveStatus': 'INACTIVE'
   *     }
   *   },
   *
   *   // Condition check operation to validate without changes
   *   {
   *     type: TransactionOperationType.ConditionCheck,
   *     key: { userId: '101' },
   *     conditionExpression: 'attribute_exists(userId) AND #status = :activeStatus AND age > :minAge',
   *     expressionNames: {
   *       '#status': 'status'
   *     },
   *     expressionValues: {
   *       ':activeStatus': 'ACTIVE',
   *       ':minAge': 18
   *     }
   *   }
   * ]);
   *
   * // Handle the response
   * if (result.success) {
   *   console.log('Transaction executed successfully:', result.data);
   *   // Transaction successful - all operations succeeded or none were applied
   * } else {
   *   console.error('Transaction failed:', result.error);
   *   // Transaction failed - could be due to a condition check failure
   *   // No changes would have been made to any items
   * }
   */
  async executeTransaction(operations: TransactionItem[]): Promise<OperationResponse> {
    return executeTransaction(this.client, this.tableName, operations);
  }

  /**
   * Get multiple items in a transaction
   *
   * @param items - Array of items to retrieve with their keys and optional table names
   * @returns Promise resolving to an OperationResponse with retrieved items
   *
   * @example
   * // Get multiple items atomically in a transaction
   * const result = await db.transactionGet([
   *   {
   *     key: { userId: '123' }
   *   },
   *   {
   *     key: { userId: '456' }
   *   },
   *   {
   *     key: { orderId: '789' },
   *     tableName: 'Orders' // Override default table name
   *   }
   * ]);
   *
   * // Handle the response
   * if (result.success) {
   *   const items = result.data.items; // Array of retrieved items in same order as request
   *   const userItem1 = items[0];
   *   const userItem2 = items[1];
   *   const orderItem = items[2];
   * } else {
   *   console.error('Transaction get failed:', result.error);
   * }
   */
  async transactionGet(
    items: { key: Record<string, any>; tableName?: string }[]
  ): Promise<OperationResponse> {
    return transactionGet(this.client, this.tableName, items);
  }

  /**
   * Update an item in the table
   *
   * @param key - The primary key of the item to update
   * @param updates - Array of field updates or an UpdateBuilder instance
   * @param options - Optional settings for the update operation
   * @returns Promise resolving to an OperationResponse with update results
   *
   * @example
   * // Update using an array of field updates
   * const result = await db.update(
   *   { userId: '123' },
   *   [
   *     { field: 'name', value: 'John Smith', operation: 'SET' },
   *     { field: 'age', value: 1, operation: 'ADD' },
   *     { field: 'status', value: 'active', operation: 'SET' }
   *   ],
   *   {
   *     returnValues: 'ALL_NEW',
   *     conditionExpression: 'attribute_exists(userId)'
   *   }
   * );
   *
   * // Update using the UpdateBuilder
   * const updateBuilder = db.updateBuilder()
   *   .set('name', 'John Smith')
   *   .add('age', 1)
   *   .set('status', 'active');
   *
   * const result = await db.update(
   *   { userId: '123' },
   *   updateBuilder,
   *   { returnValues: 'ALL_NEW' }
   * );
   *
   * // Handle the response
   * if (result.success) {
   *   const updatedItem = result.data;
   * } else {
   *   console.error('Update failed:', result.error);
   * }
   */
  async update(
    key: Record<string, any>,
    updates: FieldUpdate[] | { build(): FieldUpdate[] },
    options?: ClientUpdateOptions
  ): Promise<OperationResponse> {
    const updateOpts: UpdateOptions = {
      ...options,
      returnValues: options?.returnValues === 'NONE' ? 'ALL_NEW' : options?.returnValues,
    };
    const updateFields = 'build' in updates ? updates.build() : updates;
    return updateItem(this.client, this.tableName, key, updateFields, updateOpts);
  }

  /**
   * Create a new item in the table
   *
   * @param item - The item to create
   * @param options - Optional settings for the create operation
   * @returns Promise resolving to an OperationResponse with creation results
   *
   * @example
   * // Create a new user
   * const result = await db.create(
   *   {
   *     userId: '123',
   *     name: 'John Doe',
   *     email: 'john@example.com',
   *     age: 30,
   *     createdAt: new Date().toISOString()
   *   },
   *   {
   *     conditionExpression: 'attribute_not_exists(userId)',
   *     returnValues: 'NONE'
   *   }
   * );
   *
   * // Handle the response
   * if (result.success) {
   *   console.log('Item created successfully');
   * } else {
   *   console.error('Create failed:', result.error);
   *   // This could happen if the item already exists
   * }
   */
  async create(item: Record<string, any>, options?: PutOptions): Promise<OperationResponse> {
    const createOpts: CreateOptions = {
      ...options,
      returnValues:
        options?.returnValues === 'ALL_NEW' ||
        options?.returnValues === 'UPDATED_OLD' ||
        options?.returnValues === 'UPDATED_NEW'
          ? 'NONE'
          : options?.returnValues,
    };
    return createItem(this.client, this.tableName, item, createOpts);
  }

  /**
   * Read an item from the table
   *
   * @param key - The primary key of the item to read. For tables with a composite key, you must include both the partition key and sort key.
   * @param options - Optional settings for the read operation
   * @returns Promise resolving to an OperationResponse with the retrieved item
   *
   * @example
   * // Read an item with simple primary key
   * const result = await db.read({
   *   userId: '123'
   * });
   *
   * // Read an item with composite key (partition key + sort key)
   * const result = await db.read({
   *   userId: '123',
   *   timestamp: 1622505600000
   * });
   *
   * // Read with consistent read and consumed capacity
   * const result = await db.read(
   *   { userId: '123', timestamp: 1622505600000 },
   *   {
   *     consistentRead: true,
   *     returnConsumedCapacity: 'TOTAL'
   *   }
   * );
   *
   * // Handle the response
   * if (result.success) {
   *   const item = result.data;
   *   // item will be undefined if not found
   *   if (item) {
   *     console.log('Retrieved item:', item);
   *   } else {
   *     console.log('Item not found');
   *   }
   *
   *   // Check consumed capacity if requested
   *   if (result.consumedCapacity) {
   *     console.log('Consumed capacity:', result.consumedCapacity);
   *   }
   * } else {
   *   console.error('Read failed:', result.error);
   * }
   */
  async read(
    key: Record<string, any>,
    options?: { consistentRead?: boolean; returnConsumedCapacity?: 'INDEXES' | 'TOTAL' | 'NONE' }
  ): Promise<OperationResponse> {
    return readItem(this.client, this.tableName, key, options);
  }

  /**
   * Delete an item from the table
   *
   * @param key - The primary key of the item to delete
   * @param options - Optional settings for the delete operation
   * @returns Promise resolving to an OperationResponse with delete results
   *
   * @example
   * // Delete a user with default options
   * const result = await db.delete({
   *   userId: '123'
   * });
   *
   * // Delete with condition and return values
   * const result = await db.delete(
   *   { userId: '123' },
   *   {
   *     conditionExpression: 'attribute_exists(userId)',
   *     returnValues: 'ALL_OLD'
   *   }
   * );
   *
   * // Handle the response
   * if (result.success) {
   *   if (result.data) {
   *     // If returnValues was specified, the deleted item is returned
   *     console.log('Deleted item:', result.data);
   *   } else {
   *     console.log('Item deleted successfully');
   *   }
   * } else {
   *   console.error('Delete failed:', result.error);
   *   // This could happen if the condition wasn't met
   * }
   */
  async delete(
    key: Record<string, any>,
    options?: ClientDeleteOptions
  ): Promise<OperationResponse> {
    const deleteOpts: DeleteOptions = {
      ...options,
      returnValues:
        options?.returnValues === 'UPDATED_OLD' ||
        options?.returnValues === 'UPDATED_NEW' ||
        options?.returnValues === 'ALL_NEW'
          ? 'ALL_OLD'
          : options?.returnValues,
    };
    return deleteItem(this.client, this.tableName, key, deleteOpts);
  }

  /**
   * Get the ARN for the table's stream
   *
   * @returns Promise resolving to an OperationResponse with the stream ARN
   *
   * @example
   * // Get the stream ARN for the table
   * const result = await db.getStreamArn();
   *
   * // Handle the response
   * if (result.success) {
   *   const streamArn = result.data.streamArn;
   *   console.log('Stream ARN:', streamArn);
   * } else {
   *   console.error('Failed to get stream ARN:', result.error);
   * }
   */
  async getStreamArn(): Promise<OperationResponse> {
    try {
      // Create a DynamoDB Streams client using the same configuration
      const streamsClient = new DynamoDBStreamsClient({
        region: this.client.config.region,
        endpoint: this.client.config.endpoint,
        credentials: this.client.config.credentials,
      });

      return await getTableStreamArn(streamsClient, this.tableName);
    } catch (error) {
      return handleError('Failed to get stream ARN', error);
    }
  }

  /**
   * Get information about a stream
   *
   * @param streamArn - The ARN of the stream to describe
   * @returns Promise resolving to an OperationResponse with stream details
   *
   * @example
   * // First get the stream ARN
   * const arnResult = await db.getStreamArn();
   * if (!arnResult.success) {
   *   console.error('Failed to get stream ARN:', arnResult.error);
   *   return;
   * }
   *
   * // Then describe the stream
   * const streamArn = arnResult.data.streamArn;
   * const result = await db.describeStream(streamArn);
   *
   * // Handle the response
   * if (result.success) {
   *   const streamDescription = result.data;
   *   console.log('Stream details:', streamDescription);
   *
   *   // Access stream information
   *   const streamStatus = streamDescription.StreamStatus;
   *   const shards = streamDescription.Shards;
   * } else {
   *   console.error('Failed to describe stream:', result.error);
   * }
   */
  async describeStream(streamArn: string): Promise<OperationResponse> {
    try {
      // Create a DynamoDB Streams client using the same configuration
      const streamsClient = new DynamoDBStreamsClient({
        region: this.client.config.region,
        endpoint: this.client.config.endpoint,
        credentials: this.client.config.credentials,
      });

      return await describeStream(streamsClient, streamArn);
    } catch (error) {
      return handleError('Failed to describe stream', error);
    }
  }

  /**
   * Get stream records using a shard iterator
   *
   * @param shardIterator - The shard iterator to use
   * @param limit - Optional maximum number of records to retrieve
   * @returns Promise resolving to an OperationResponse with stream records
   *
   * @example
   * // First get the stream ARN and shard iterator
   * const arnResult = await db.getStreamArn();
   * if (!arnResult.success) return;
   *
   * const streamArn = arnResult.data.streamArn;
   * const describeResult = await db.describeStream(streamArn);
   * if (!describeResult.success) return;
   *
   * const shardId = describeResult.data.Shards[0].ShardId;
   *
   * // Get a shard iterator
   * const iteratorResult = await db.getShardIterator(
   *   streamArn,
   *   shardId,
   *   'LATEST'
   * );
   * if (!iteratorResult.success) return;
   *
   * // Get records using the iterator
   * const iterator = iteratorResult.data.ShardIterator;
   * const recordsResult = await db.getStreamRecords(iterator, 10);
   *
   * // Handle the response
   * if (recordsResult.success) {
   *   const records = recordsResult.data.Records || [];
   *   const nextIterator = recordsResult.data.NextShardIterator;
   *
   *   console.log(`Retrieved ${records.length} records`);
   *
   *   // Process each record
   *   for (const record of records) {
   *     const eventName = record.eventName; // INSERT, MODIFY, REMOVE
   *     const oldImage = record.dynamodb.OldImage;
   *     const newImage = record.dynamodb.NewImage;
   *
   *     console.log(`Event: ${eventName}`, { oldImage, newImage });
   *   }
   * } else {
   *   console.error('Failed to get stream records:', recordsResult.error);
   * }
   */
  async getStreamRecords(shardIterator: string, limit?: number): Promise<OperationResponse> {
    try {
      // Create a DynamoDB Streams client using the same configuration
      const streamsClient = new DynamoDBStreamsClient({
        region: this.client.config.region,
        endpoint: this.client.config.endpoint,
        credentials: this.client.config.credentials,
      });

      return await getStreamRecords(streamsClient, shardIterator, limit);
    } catch (error) {
      return handleError('Failed to get stream records', error);
    }
  }

  /**
   * Get a shard iterator for a stream
   *
   * @param streamArn - The ARN of the stream
   * @param shardId - The ID of the shard
   * @param iteratorType - The type of iterator (LATEST, TRIM_HORIZON, AT_SEQUENCE_NUMBER, AFTER_SEQUENCE_NUMBER)
   * @param sequenceNumber - The sequence number (required for AT_SEQUENCE_NUMBER and AFTER_SEQUENCE_NUMBER)
   * @returns Promise resolving to an OperationResponse with the shard iterator
   *
   * @example
   * // Import the necessary types
   * import { ShardIteratorType } from 'dyndb-client';
   *
   * // Get a shard iterator for a stream
   * const streamArn = 'arn:aws:dynamodb:region:account:table/tablename/stream/timestamp';
   * const shardId = 'shardId-00000000000000000000-00000000';
   *
   * // Get latest records
   * const result = await db.getShardIterator(
   *   streamArn,
   *   shardId,
   *   ShardIteratorType.LATEST
   * );
   *
   * // Or get all records from the beginning
   * const result = await db.getShardIterator(
   *   streamArn,
   *   shardId,
   *   ShardIteratorType.TRIM_HORIZON
   * );
   *
   * // Or get records starting from a specific sequence number
   * const result = await db.getShardIterator(
   *   streamArn,
   *   shardId,
   *   ShardIteratorType.AT_SEQUENCE_NUMBER,
   *   '0123456789'
   * );
   *
   * // Handle the response
   * if (result.success) {
   *   const iterator = result.data.ShardIterator;
   *   console.log('Shard iterator:', iterator);
   * } else {
   *   console.error('Failed to get shard iterator:', result.error);
   * }
   */
  async getShardIterator(
    streamArn: string,
    shardId: string,
    iteratorType: ShardIteratorType,
    sequenceNumber?: string
  ): Promise<OperationResponse> {
    try {
      // Create a DynamoDB Streams client using the same configuration
      const streamsClient = new DynamoDBStreamsClient({
        region: this.client.config.region,
        endpoint: this.client.config.endpoint,
        credentials: this.client.config.credentials,
      });

      return await getShardIterator(
        streamsClient,
        streamArn,
        shardId,
        iteratorType,
        sequenceNumber
      );
    } catch (error) {
      return handleError('Failed to get shard iterator', error);
    }
  }

  /**
   * Process a stream with a handler function
   *
   * @param streamArn - The ARN of the stream to process
   * @param handler - The handler function to process stream records
   * @param config - Optional configuration for stream processing
   *
   * @example
   * // Define a stream handler
   * const streamHandler: StreamHandler = async (records) => {
   *   for (const record of records) {
   *     const eventName = record.eventName; // INSERT, MODIFY, REMOVE
   *     const keys = record.dynamodb.Keys;
   *     const newImage = record.dynamodb.NewImage;
   *     const oldImage = record.dynamodb.OldImage;
   *
   *     console.log(`Event: ${eventName}`, { keys, newImage, oldImage });
   *
   *     // Perform actions based on the event
   *     if (eventName === 'INSERT') {
   *       await processNewItem(newImage);
   *     } else if (eventName === 'MODIFY') {
   *       await processModifiedItem(oldImage, newImage);
   *     } else if (eventName === 'REMOVE') {
   *       await processRemovedItem(oldImage);
   *     }
   *   }
   *
   *   // Return true to continue processing, false to stop
   *   return true;
   * };
   *
   * // Process the stream with configuration
   * try {
   *   await db.processStream(
   *     'arn:aws:dynamodb:region:account:table/tablename/stream/timestamp',
   *     streamHandler,
   *     {
   *       iteratorType: 'LATEST',
   *       pollInterval: 1000,
   *       maxPolls: 10,
   *       batchSize: 100
   *     }
   *   );
   *   console.log('Stream processing completed');
   * } catch (error) {
   *   console.error('Stream processing error:', error);
   * }
   */
  async processStream(
    streamArn: string,
    handler: StreamHandler,
    config: Partial<StreamProcessingConfig> = {}
  ): Promise<void> {
    try {
      // Create a DynamoDB Streams client using the same configuration
      const streamsClient = new DynamoDBStreamsClient({
        region: this.client.config.region,
        endpoint: this.client.config.endpoint,
        credentials: this.client.config.credentials,
      });

      await processStream(streamsClient, streamArn, handler, config);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Start processing the table's stream
   *
   * @param handler - The handler function to process stream records
   * @param options - Optional settings including a stream ARN
   * @param config - Optional configuration for stream processing
   *
   * @example
   * // Define a stream handler
   * const streamHandler: StreamHandler = async (records) => {
   *   for (const record of records) {
   *     const eventName = record.eventName;
   *     const newImage = record.dynamodb.NewImage;
   *
   *     console.log(`Processing ${eventName} event:`, newImage);
   *
   *     // Your business logic here
   *     // e.g., update analytics, trigger notifications, etc.
   *   }
   *   return true; // Continue processing
   * };
   *
   * // Start processing the table's stream
   * try {
   *   // Auto-detects the stream ARN if not provided
   *   await db.startStreamProcessing(
   *     streamHandler,
   *     {}, // Options (can provide streamArn explicitly if needed)
   *     {
   *       iteratorType: 'LATEST', // Start from now (new changes only)
   *       pollInterval: 2000,     // Poll every 2 seconds
   *       batchSize: 25,          // Process up to 25 records at a time
   *       maxPolls: 0             // Run indefinitely (until error or explicit stop)
   *     }
   *   );
   *
   *   console.log('Stream processing started');
   * } catch (error) {
   *   console.error('Failed to start stream processing:', error);
   * }
   */
  async startStreamProcessing(
    handler: StreamHandler,
    options: Partial<StreamOptions> = {},
    config: Partial<StreamProcessingConfig> = {}
  ): Promise<void> {
    try {
      // Get the stream ARN if not provided
      let streamArn = options.streamArn;
      if (!streamArn) {
        const streamResult = await this.getStreamArn();
        if (!streamResult.success || !streamResult.data.streamArn) {
          throw streamResult.error || new Error('Stream ARN not found');
        }
        streamArn = streamResult.data.streamArn;
      }

      // Create a DynamoDB Streams client using the same configuration
      const streamsClient = new DynamoDBStreamsClient({
        region: this.client.config.region,
        endpoint: this.client.config.endpoint,
        credentials: this.client.config.credentials,
      });

      // Type assertion to ensure TypeScript knows streamArn is defined
      await processStream(streamsClient, streamArn as string, handler, config);
    } catch (error) {
      throw error;
    }
  }
}
