/**
 * Centralized error handling for the DynamoDB wrapper
 * Processes and enriches errors with additional context
 */
/**
 * Custom error types for DynamoDB operations
 */
export declare enum DynamoErrorType {
    ValidationError = "ValidationError",
    ConditionalCheckFailed = "ConditionalCheckFailed",
    ResourceNotFound = "ResourceNotFound",
    ResourceInUse = "ResourceInUse",
    ProvisionedThroughputExceeded = "ProvisionedThroughputExceeded",
    ThrottlingError = "ThrottlingError",
    AccessDenied = "AccessDenied",
    NetworkError = "NetworkError",
    InternalError = "InternalError",
    UnknownError = "UnknownError"
}
/**
 * Custom error class for DynamoDB operations
 */
export declare class DynamoError extends Error {
    readonly type: DynamoErrorType;
    readonly originalError?: Error;
    readonly statusCode?: number;
    readonly requestId?: string;
    constructor(type: DynamoErrorType, message: string, originalError?: Error, statusCode?: number, requestId?: string);
    /**
     * Get error details in a structured format
     */
    getDetails(): Record<string, any>;
}
/**
 * Handle DynamoDB errors in a consistent way
 *
 * @param context - Context message for the error
 * @param error - The original error
 * @returns OperationResponse with error details
 */
export declare function handleError(context: string, error: unknown): {
    success: false;
    error: Error | DynamoError;
};
/**
 * Check if an error is a specific type of DynamoDB error
 */
export declare function isDynamoErrorType(error: unknown, type: DynamoErrorType): boolean;
/**
 * Get error details in a structured format
 */
export declare function getErrorDetails(error: unknown): Record<string, any>;
/**
 * Validate that a value is a non-empty string
 * @param value - The value to validate
 * @param errorMessage - Optional custom error message
 * @throws Error if the value is not a non-empty string
 */
export declare function validateString(value: any, errorMessage?: string): void;
/**
 * Validate that a value is a number
 * @param value - The value to validate
 * @param errorMessage - Optional custom error message
 * @throws Error if the value is not a number
 */
export declare function validateNumber(value: any, errorMessage?: string): void;
/**
 * Validate that a field name is valid
 * @param fieldName - The field name to validate
 * @param errorMessage - Optional custom error message
 * @throws Error if the field name is invalid
 */
export declare function validateFieldName(fieldName: any, errorMessage?: string): void;
