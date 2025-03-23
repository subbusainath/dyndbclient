/**
 * Common constants used throughout the DynamoDB wrapper
 */

export const DEFAULT_CONFIG = {
  /** Maximum number of retries for operations */
  MAX_RETRIES: 3,

  /** Default capacity units for batch operations */
  BATCH_SIZE: 25,

  /** Timeout in milliseconds for operations */
  OPERATION_TIMEOUT: 5000,
};

/**
 * Error messages used throughout the wrapper
 */
export const ERROR_MESSAGES = {
  INVALID_CONFIG: 'Invalid configuration provided',
  TABLE_NOT_FOUND: 'DynamoDB table not found',
  OPERATION_TIMEOUT: 'Operation timed out',
  BATCH_OPERATION_FAILED: 'Batch operation failed',
  TRANSACTION_FAILED: 'Transaction operation failed',
};

/**
 * Operation types for logging and monitoring
 */
export const OPERATION_TYPES = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  QUERY: 'QUERY',
  SCAN: 'SCAN',
  BATCH: 'BATCH',
  TRANSACTION: 'TRANSACTION',
} as const;
