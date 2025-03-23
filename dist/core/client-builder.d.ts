import { DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DyndbClient } from './client';
/**
 * Builder class for creating DyndbClient instances with a fluent interface
 */
export declare class ClientBuilder {
    private config;
    /**
     * Set the AWS region
     */
    withRegion(region: string): ClientBuilder;
    /**
     * Set the DynamoDB table name
     */
    withTableName(tableName: string): ClientBuilder;
    /**
     * Set the DynamoDB endpoint
     */
    withEndpoint(endpoint: string): ClientBuilder;
    /**
     * Set the AWS SDK DynamoDB client options
     * Note: If you don't provide credentials, the AWS SDK will use the default credential provider chain
     * which checks environment variables, shared credentials file (~/.aws/credentials),
     * and EC2/ECS instance credentials in that order.
     *
     * @example
     * // Using explicit credentials
     * builder.withClientOptions({
     *   credentials: {
     *     accessKeyId: 'YOUR_ACCESS_KEY',
     *     secretAccessKey: 'YOUR_SECRET_KEY'
     *   }
     * });
     *
     * // Using AWS CLI profile
     * builder.withClientOptions({
     *   profile: 'my-profile-name'
     * });
     *
     * // Using default credential provider chain (recommended for production)
     * // Don't provide credentials - they'll be loaded automatically
     */
    withClientOptions(options: Partial<DynamoDBClientConfig>): ClientBuilder;
    /**
     * Enable consistent reads
     */
    withConsistentRead(consistentRead: boolean): ClientBuilder;
    /**
     * Build and return a new DyndbClient instance
     */
    build(): DyndbClient;
}
