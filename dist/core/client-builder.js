"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientBuilder = void 0;
const client_1 = require("./client");
/**
 * Builder class for creating DyndbClient instances with a fluent interface
 */
class ClientBuilder {
    constructor() {
        this.config = {
            clientOptions: {}
        };
    }
    /**
     * Set the AWS region
     */
    withRegion(region) {
        if (!region || region.trim() === '') {
            throw new Error('Region must be a non-empty string');
        }
        this.config.region = region;
        return this;
    }
    /**
     * Set the DynamoDB table name
     */
    withTableName(tableName) {
        if (!tableName || tableName.trim() === '') {
            throw new Error('Table name must be a non-empty string');
        }
        if (!/^[a-zA-Z0-9\-_]+$/.test(tableName)) {
            throw new Error('Table name can only contain alphanumeric characters, hyphens, and underscores');
        }
        this.config.tableName = tableName;
        return this;
    }
    /**
     * Set the DynamoDB endpoint
     */
    withEndpoint(endpoint) {
        if (!endpoint || endpoint.trim() === '') {
            throw new Error('Endpoint must be a non-empty string');
        }
        try {
            new URL(endpoint);
        }
        catch {
            throw new Error('Invalid endpoint URL format');
        }
        this.config.endpoint = endpoint;
        return this;
    }
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
    withClientOptions(options) {
        if (!options || typeof options !== 'object') {
            throw new Error('Client options must be an object');
        }
        this.config.clientOptions = options;
        return this;
    }
    /**
     * Enable consistent reads
     */
    withConsistentRead(consistentRead) {
        if (typeof consistentRead !== 'boolean') {
            throw new Error('Consistent read must be a boolean value');
        }
        this.config.consistentRead = consistentRead;
        return this;
    }
    /**
     * Build and return a new DyndbClient instance
     */
    build() {
        // Validate required fields
        if (!this.config.region) {
            throw new Error('Region is required');
        }
        if (!this.config.tableName) {
            throw new Error('Table name is required');
        }
        // clientOptions are now optional - they will default to an empty object
        if (!this.config.clientOptions) {
            this.config.clientOptions = {};
        }
        // Only validate credentials if explicitly using a non-local endpoint
        // This allows the AWS SDK to use the default credential provider chain when no credentials are provided
        if (this.config.endpoint &&
            !this.config.endpoint.includes('localhost') &&
            !this.config.endpoint.includes('127.0.0.1') &&
            this.config.clientOptions.credentials) {
            // If credentials are explicitly provided for non-local endpoint, validate them
            const creds = this.config.clientOptions.credentials;
            if (!creds.accessKeyId || !creds.secretAccessKey ||
                creds.accessKeyId.trim() === '' || creds.secretAccessKey.trim() === '') {
                throw new Error('If explicit credentials are provided for non-local endpoints, they cannot be empty');
            }
        }
        return new client_1.DyndbClient(this.config);
    }
}
exports.ClientBuilder = ClientBuilder;
//# sourceMappingURL=client-builder.js.map