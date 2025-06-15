# DyndbClient Example

This is an example project demonstrating the usage of the DyndbClient library with a local DynamoDB instance.

## Prerequisites

- Node.js (v14 or later)
- Docker and Docker Compose
- TypeScript

## Setup

1. Start the local DynamoDB instance:
```bash
docker-compose up -d
```

2. Install dependencies:
```bash
npm install
```

3. Run the example:
```bash
npm start
```

## What's Included

This example demonstrates:

1. Setting up a local DynamoDB instance
2. Creating a table with composite key (userId + email)
3. CRUD operations:
   - Creating a user
   - Reading a user
   - Updating a user
   - Deleting a user
4. Query operations
5. Error handling

## Example Output

The example will output the results of each operation, showing:
- Success/failure status
- Response data
- Any errors that occur

## Cleanup

To stop the local DynamoDB instance:
```bash
docker-compose down
```

## Notes

- The example uses a local DynamoDB instance running in Docker
- Credentials are set to 'local' for development purposes
- The table is created with minimal provisioned throughput (5 RCU/WCU)
- Error handling is included for common scenarios
  