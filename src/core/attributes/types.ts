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
  // String validations (for S type)
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  // Number validations (for N type)
  min?: number;
  max?: number;
  // Set validations (for SS, NS, BS types)
  minSize?: number;
  maxSize?: number;
  // List validations (for L type)
  itemType?: DynamoDBAttributeTypeValue;
  // Map validations (for M type)
  allowedFields?: Record<string, DynamoDBAttributeTypeValue>;
  // Custom validation
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
export enum AttributeErrorType {
  INVALID_NAME = 'INVALID_NAME',
  INVALID_TYPE = 'INVALID_TYPE',
  RESERVED_WORD = 'RESERVED_WORD',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NO_ATTRIBUTES = 'NO_ATTRIBUTES',
  INVALID_MIN_LENGTH = 'INVALID_MIN_LENGTH',
  INVALID_MAX_LENGTH = 'INVALID_MAX_LENGTH',
  INVALID_RANGE = 'INVALID_RANGE',
  INVALID_PERCENTAGE = 'INVALID_PERCENTAGE',
  MISSING_ITEM_TYPE = 'MISSING_ITEM_TYPE',
  INVALID_ITEM_TYPE = 'INVALID_ITEM_TYPE',
  MISSING_ALLOWED_VALUES = 'MISSING_ALLOWED_VALUES',
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
  // Common validations
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  allowedValues?: string[];
  itemType?: DynamoDBAttributeTypeValue;
  // Custom validation
  validate?: (value: any) => boolean;
}

/**
 * Domain attribute definition
 */
export interface DomainAttributeDefinition {
  type: DomainAttributeType;
  required?: boolean;
  description?: string;
  // Common validations
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  allowedValues?: string[];
  itemType?: DomainAttributeType;
  // Custom validation
  validate?: (value: any) => boolean;
}

/**
 * Type conversion utilities
 */
export const TypeConversion = {
  /**
   * Maps domain type to DynamoDB type
   */
  toDynamoDBType(type: DomainAttributeType): DynamoDBAttributeTypeValue {
    const typeMap: Record<DomainAttributeType, DynamoDBAttributeTypeValue> = {
      id: 'S',
      userId: 'S',
      productId: 'S',
      orderId: 'S',
      text: 'S',
      longText: 'S',
      number: 'N',
      integer: 'N',
      boolean: 'BOOL',
      binary: 'B',
      email: 'S',
      phone: 'S',
      url: 'S',
      date: 'S',
      datetime: 'S',
      list: 'L',
      map: 'M',
      stringSet: 'SS',
      numberSet: 'NS',
      tags: 'L',
      timestamp: 'N',
      currency: 'N',
      percentage: 'N',
      status: 'S',
    };
    return typeMap[type];
  },

  /**
   * Converts domain attribute to DynamoDB attribute
   */
  toDynamoDBAttribute(attr: DomainAttributeDefinition): DynamoDBAttributeDefinition {
    return {
      ...attr,
      type: this.toDynamoDBType(attr.type),
      itemType: attr.itemType ? this.toDynamoDBType(attr.itemType) : undefined,
    };
  },
};
