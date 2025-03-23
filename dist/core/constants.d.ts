/**
 * Common constants used throughout the DynamoDB wrapper
 */
export declare const DEFAULT_CONFIG: {
    /** Maximum number of retries for operations */
    MAX_RETRIES: number;
    /** Default capacity units for batch operations */
    BATCH_SIZE: number;
    /** Timeout in milliseconds for operations */
    OPERATION_TIMEOUT: number;
};
/**
 * Error messages used throughout the wrapper
 */
export declare const ERROR_MESSAGES: {
    INVALID_CONFIG: string;
    TABLE_NOT_FOUND: string;
    OPERATION_TIMEOUT: string;
    BATCH_OPERATION_FAILED: string;
    TRANSACTION_FAILED: string;
};
/**
 * Operation types for logging and monitoring
 */
export declare const OPERATION_TYPES: {
    readonly CREATE: "CREATE";
    readonly READ: "READ";
    readonly UPDATE: "UPDATE";
    readonly DELETE: "DELETE";
    readonly QUERY: "QUERY";
    readonly SCAN: "SCAN";
    readonly BATCH: "BATCH";
    readonly TRANSACTION: "TRANSACTION";
};
