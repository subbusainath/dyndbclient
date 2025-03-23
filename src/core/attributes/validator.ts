/**
 * Validator for DynamoDB attributes
 */

import {
  TableAttributes,
  AttributeError,
  AttributeErrorType,
  OperationResult,
  TableValidationResult,
  DomainAttributeDefinition,
} from './types';
import { DomainAttributeType } from './dynamodb-types';
import { TypeConversion } from '../../types';

/**
 * Validates table attributes and item data against defined schemas
 */
export class AttributeValidator {
  /**
   * Creates an error object
   */
  private createError(
    attribute: string,
    code: AttributeErrorType,
    message?: string
  ): AttributeError {
    return {
      code,
      message: message || this.getDefaultErrorMessage(code),
      attribute,
    };
  }

  /**
   * Gets default error message for error type
   */
  private getDefaultErrorMessage(code: AttributeErrorType): string {
    switch (code) {
      case AttributeErrorType.INVALID_NAME:
        return 'Invalid attribute name';
      case AttributeErrorType.INVALID_TYPE:
        return 'Invalid attribute type';
      case AttributeErrorType.RESERVED_WORD:
        return 'Attribute name is a reserved word';
      case AttributeErrorType.VALIDATION_ERROR:
        return 'Validation error';
      case AttributeErrorType.NO_ATTRIBUTES:
        return 'Table must have at least one attribute defined';
      case AttributeErrorType.INVALID_MIN_LENGTH:
        return 'minLength must be >= 0';
      case AttributeErrorType.INVALID_MAX_LENGTH:
        return 'maxLength must be >= minLength';
      case AttributeErrorType.INVALID_RANGE:
        return 'min must be <= max';
      case AttributeErrorType.INVALID_PERCENTAGE:
        return 'Percentage must be between 0 and 100';
      case AttributeErrorType.MISSING_ITEM_TYPE:
        return 'List attribute must specify itemType';
      case AttributeErrorType.INVALID_ITEM_TYPE:
        return 'Invalid item type for list';
      case AttributeErrorType.MISSING_ALLOWED_VALUES:
        return 'Status attribute must specify allowedValues';
      default:
        return 'Unknown error';
    }
  }

  /**
   * Validates table attributes definition and converts to DynamoDB format
   */
  public validateTableAttributes(
    table:
      | TableAttributes
      | { tableName: string; attributes: Record<string, DomainAttributeDefinition> }
  ): OperationResult<TableValidationResult> {
    const errors: AttributeError[] = [];

    if (!table.tableName || table.tableName.trim() === '') {
      errors.push(
        this.createError('tableName', AttributeErrorType.INVALID_NAME, 'Table name is required')
      );
      return { success: false, errors };
    }

    if (!table.attributes || Object.keys(table.attributes).length === 0) {
      errors.push(
        this.createError(
          'attributes',
          AttributeErrorType.NO_ATTRIBUTES,
          'At least one attribute is required'
        )
      );
      return { success: false, errors };
    }

    // Convert domain attributes if needed
    const convertedTable =
      'type' in table.attributes[Object.keys(table.attributes)[0]]
        ? {
            ...table,
            attributes: Object.entries(table.attributes).reduce(
              (acc, [key, attr]) => ({
                ...acc,
                [key]: TypeConversion.toDynamoDBAttribute(attr as DomainAttributeDefinition),
              }),
              {}
            ),
          }
        : table;

    // Validate each attribute
    for (const [name, attr] of Object.entries(convertedTable.attributes)) {
      if (!this.isValidAttributeName(name)) {
        errors.push(this.createError(name, AttributeErrorType.RESERVED_WORD));
        continue;
      }

      errors.push(...this.validateAttributeDefinition(name, attr));
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return {
      success: true,
      data: convertedTable as TableValidationResult,
    };
  }

  /**
   * Validates a single attribute definition
   */
  private validateAttributeDefinition(
    name: string,
    attr: DomainAttributeDefinition
  ): AttributeError[] {
    const errors: AttributeError[] = [];

    // Validate attribute name
    if (!this.isValidAttributeName(name)) {
      errors.push(this.createError(name, AttributeErrorType.INVALID_NAME));
    }

    // Validate type
    if (!this.isValidDomainType(attr.type)) {
      errors.push(this.createError(name, AttributeErrorType.INVALID_TYPE));
    }

    // Validate type-specific constraints
    switch (attr.type) {
      case 'text':
      case 'longText':
        if (attr.minLength !== undefined && attr.minLength < 0) {
          errors.push(this.createError(name, AttributeErrorType.INVALID_MIN_LENGTH));
        }
        if (
          attr.maxLength !== undefined &&
          attr.minLength !== undefined &&
          attr.maxLength < attr.minLength
        ) {
          errors.push(this.createError(name, AttributeErrorType.INVALID_MAX_LENGTH));
        }
        break;

      case 'number':
      case 'integer':
      case 'currency':
      case 'percentage':
        if (attr.min !== undefined && attr.max !== undefined && attr.min > attr.max) {
          errors.push(this.createError(name, AttributeErrorType.INVALID_RANGE));
        }
        if (attr.type === 'percentage') {
          const min = attr.min ?? 0;
          const max = attr.max ?? 100;
          if (min < 0 || max > 100) {
            errors.push(this.createError(name, AttributeErrorType.INVALID_PERCENTAGE));
          }
        }
        break;

      case 'list':
        if (!attr.itemType) {
          errors.push(this.createError(name, AttributeErrorType.MISSING_ITEM_TYPE));
        } else if (!this.isValidDomainType(attr.itemType)) {
          errors.push(this.createError(name, AttributeErrorType.INVALID_ITEM_TYPE));
        }
        break;

      case 'status':
        if (!attr.allowedValues || attr.allowedValues.length === 0) {
          errors.push(this.createError(name, AttributeErrorType.MISSING_ALLOWED_VALUES));
        }
        break;
    }

    return errors;
  }

  /**
   * Validates attribute name format
   */
  private isValidAttributeName(name: string): boolean {
    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);
  }

  /**
   * Validates domain type
   */
  private isValidDomainType(type: DomainAttributeType): boolean {
    const validTypes = [
      'id',
      'userId',
      'productId',
      'orderId',
      'text',
      'longText',
      'number',
      'integer',
      'boolean',
      'binary',
      'email',
      'phone',
      'url',
      'date',
      'datetime',
      'list',
      'map',
      'stringSet',
      'numberSet',
      'tags',
      'timestamp',
      'currency',
      'percentage',
      'status',
    ];
    return validTypes.includes(type);
  }
}
