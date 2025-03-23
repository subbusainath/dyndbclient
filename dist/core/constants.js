"use strict";
/**
 * Common constants used throughout the DynamoDB wrapper
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPERATION_TYPES = exports.ERROR_MESSAGES = exports.DEFAULT_CONFIG = void 0;
exports.DEFAULT_CONFIG = {
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
exports.ERROR_MESSAGES = {
    INVALID_CONFIG: 'Invalid configuration provided',
    TABLE_NOT_FOUND: 'DynamoDB table not found',
    OPERATION_TIMEOUT: 'Operation timed out',
    BATCH_OPERATION_FAILED: 'Batch operation failed',
    TRANSACTION_FAILED: 'Transaction operation failed',
};
/**
 * Operation types for logging and monitoring
 */
exports.OPERATION_TYPES = {
    CREATE: 'CREATE',
    READ: 'READ',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    QUERY: 'QUERY',
    SCAN: 'SCAN',
    BATCH: 'BATCH',
    TRANSACTION: 'TRANSACTION',
};
//# sourceMappingURL=constants.js.map