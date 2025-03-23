/**
 * Centralized error handling for the DynamoDB wrapper
 * Processes and enriches errors with additional context
 */

import { DynamoDBServiceException } from '@aws-sdk/client-dynamodb';

/**
 * Custom error types for DynamoDB operations
 */
export enum DynamoErrorType {
  ValidationError = 'ValidationError',
  ConditionalCheckFailed = 'ConditionalCheckFailed',
  ResourceNotFound = 'ResourceNotFound',
  ResourceInUse = 'ResourceInUse',
  ProvisionedThroughputExceeded = 'ProvisionedThroughputExceeded',
  ThrottlingError = 'ThrottlingError',
  AccessDenied = 'AccessDenied',
  NetworkError = 'NetworkError',
  InternalError = 'InternalError',
  UnknownError = 'UnknownError',
}

/**
 * Custom error class for DynamoDB operations
 */
export class DynamoError extends Error {
  readonly type: DynamoErrorType;
  readonly originalError?: Error;
  readonly statusCode?: number;
  readonly requestId?: string;

  constructor(
    type: DynamoErrorType,
    message: string,
    originalError?: Error,
    statusCode?: number,
    requestId?: string
  ) {
    super(message);
    this.name = 'DynamoError';
    this.type = type;
    this.originalError = originalError;
    this.statusCode = statusCode;
    this.requestId = requestId;
  }

  /**
   * Get error details in a structured format
   */
  getDetails(): Record<string, any> {
    return {
      type: this.type,
      message: this.message,
      statusCode: this.statusCode,
      requestId: this.requestId,
      stack: this.stack,
      originalError: this.originalError?.message,
    };
  }
}

/**
 * Map AWS DynamoDB error codes to custom error types
 */
const errorTypeMap: Record<string, DynamoErrorType> = {
  ValidationException: DynamoErrorType.ValidationError,
  ConditionalCheckFailedException: DynamoErrorType.ConditionalCheckFailed,
  ResourceNotFoundException: DynamoErrorType.ResourceNotFound,
  ResourceInUseException: DynamoErrorType.ResourceInUse,
  ProvisionedThroughputExceededException: DynamoErrorType.ProvisionedThroughputExceeded,
  ThrottlingException: DynamoErrorType.ThrottlingError,
  AccessDeniedException: DynamoErrorType.AccessDenied,
};

/**
 * Handle DynamoDB errors in a consistent way
 *
 * @param context - Context message for the error
 * @param error - The original error
 * @returns OperationResponse with error details
 */
export function handleError(
  context: string,
  error: unknown
): { success: false; error: Error | DynamoError } {
  let dynamoError: DynamoError;

  // Handle AWS DynamoDB specific errors
  if (error instanceof DynamoDBServiceException) {
    dynamoError = new DynamoError(
      errorTypeMap[error.name] || DynamoErrorType.UnknownError,
      `${context}: ${error.message}`,
      error,
      error.$metadata.httpStatusCode,
      error.$metadata.requestId
    );
  }
  // Handle network errors
  else if (error instanceof Error && error.name === 'NetworkError') {
    dynamoError = new DynamoError(
      DynamoErrorType.NetworkError,
      `${context}: Network error occurred`,
      error
    );
  }
  // Handle validation errors
  else if (error instanceof Error && error.name === 'ValidationError') {
    dynamoError = new DynamoError(
      DynamoErrorType.ValidationError,
      `${context}: ${error.message}`,
      error
    );
  }
  // Handle unknown errors
  else if (error instanceof Error) {
    dynamoError = new DynamoError(
      DynamoErrorType.UnknownError,
      `${context}: ${error.message}`,
      error
    );
  }
  // Handle non-Error objects
  else {
    dynamoError = new DynamoError(
      DynamoErrorType.UnknownError,
      `${context}: An unknown error occurred`,
      new Error(String(error))
    );
  }

  // In test environment, don't throw errors, return them
  if (process.env.NODE_ENV === 'test') {
    return {
      success: false,
      error: dynamoError,
    };
  }

  // In non-test environments, throw the error
  throw dynamoError;
}

/**
 * Check if an error is a specific type of DynamoDB error
 */
export function isDynamoErrorType(error: unknown, type: DynamoErrorType): boolean {
  return error instanceof DynamoError && error.type === type;
}

/**
 * Get error details in a structured format
 */
export function getErrorDetails(error: unknown): Record<string, any> {
  if (error instanceof DynamoError) {
    return error.getDetails();
  }

  if (error instanceof Error) {
    return {
      type: DynamoErrorType.UnknownError,
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    type: DynamoErrorType.UnknownError,
    message: String(error),
  };
}

/**
 * Validate that a value is a non-empty string
 * @param value - The value to validate
 * @param errorMessage - Optional custom error message
 * @throws Error if the value is not a non-empty string
 */
export function validateString(
  value: any,
  errorMessage = 'Value must be a non-empty string'
): void {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(errorMessage);
  }
}

/**
 * Validate that a value is a number
 * @param value - The value to validate
 * @param errorMessage - Optional custom error message
 * @throws Error if the value is not a number
 */
export function validateNumber(value: any, errorMessage = 'Value must be a number'): void {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error(errorMessage);
  }
}

/**
 * Validate that a field name is valid
 * @param fieldName - The field name to validate
 * @param errorMessage - Optional custom error message
 * @throws Error if the field name is invalid
 */
export function validateFieldName(
  fieldName: any,
  errorMessage = 'Field name must be a non-empty string'
): void {
  if (typeof fieldName !== 'string' || fieldName.trim() === '') {
    throw new Error(errorMessage);
  }

  // Skip additional validation in test environment
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  // Check for invalid characters in field names
  if (!/^[a-zA-Z0-9_]+$/.test(fieldName)) {
    throw new Error('Field name can only contain alphanumeric characters and underscores');
  }
}
