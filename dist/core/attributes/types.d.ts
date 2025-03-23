/**
 * Types for DynamoDB attribute management
 */
import { DynamoDBAttributeTypeValue, DomainAttributeType } from './dynamodb-types';
/**
 * Definition of a single attribute with validation rules
 */
export interface AttributeDefinition {
    type: DynamoDBAttributeTypeValue;
    required?: boolean;
    description?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
    minSize?: number;
    maxSize?: number;
    itemType?: DynamoDBAttributeTypeValue;
    allowedFields?: Record<string, DynamoDBAttributeTypeValue>;
    validate?: (value: any) => boolean;
}
/**
 * Table attributes configuration
 */
export interface TableAttributes {
    tableName: string;
    attributes: Record<string, AttributeDefinition>;
    version?: number;
}
/**
 * Attribute error types
 */
export declare enum AttributeErrorType {
    INVALID_NAME = "INVALID_NAME",
    INVALID_TYPE = "INVALID_TYPE",
    RESERVED_WORD = "RESERVED_WORD",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    NO_ATTRIBUTES = "NO_ATTRIBUTES",
    INVALID_MIN_LENGTH = "INVALID_MIN_LENGTH",
    INVALID_MAX_LENGTH = "INVALID_MAX_LENGTH",
    INVALID_RANGE = "INVALID_RANGE",
    INVALID_PERCENTAGE = "INVALID_PERCENTAGE",
    MISSING_ITEM_TYPE = "MISSING_ITEM_TYPE",
    INVALID_ITEM_TYPE = "INVALID_ITEM_TYPE",
    MISSING_ALLOWED_VALUES = "MISSING_ALLOWED_VALUES"
}
/**
 * Attribute error
 */
export interface AttributeError {
    code: AttributeErrorType;
    message: string;
    attribute?: string;
}
/**
 * Operation result with optional data
 */
export interface OperationResult<T = any> {
    success: boolean;
    errors?: AttributeError[];
    data?: T;
}
/**
 * Update operation for table attributes
 */
export interface AttributeUpdateOperation {
    tableName: string;
    attributes: Record<string, AttributeDefinition>;
    version?: number;
}
/**
 * Result of an update operation
 */
export interface UpdateResult extends OperationResult {
    version?: number;
}
/**
 * Validation result
 */
export interface ValidationResult {
    isValid: boolean;
    errors?: AttributeError[];
}
/**
 * Table validation result
 */
export interface TableValidationResult {
    tableName: string;
    attributes: Record<string, DynamoDBAttributeDefinition>;
    version?: number;
}
/**
 * DynamoDB attribute definition
 */
export interface DynamoDBAttributeDefinition {
    type: DynamoDBAttributeTypeValue;
    required?: boolean;
    description?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    allowedValues?: string[];
    itemType?: DynamoDBAttributeTypeValue;
    validate?: (value: any) => boolean;
}
/**
 * Domain attribute definition
 */
export interface DomainAttributeDefinition {
    type: DomainAttributeType;
    required?: boolean;
    description?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    allowedValues?: string[];
    itemType?: DomainAttributeType;
    validate?: (value: any) => boolean;
}
/**
 * Type conversion utilities
 */
export declare const TypeConversion: {
    /**
     * Maps domain type to DynamoDB type
     */
    toDynamoDBType(type: DomainAttributeType): DynamoDBAttributeTypeValue;
    /**
     * Converts domain attribute to DynamoDB attribute
     */
    toDynamoDBAttribute(attr: DomainAttributeDefinition): DynamoDBAttributeDefinition;
};
