"use strict";
/**
 * Validator for DynamoDB attributes
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeValidator = void 0;
const types_1 = require("./types");
const types_2 = require("../../types");
/**
 * Validates table attributes and item data against defined schemas
 */
class AttributeValidator {
    /**
     * Creates an error object
     */
    createError(attribute, code, message) {
        return {
            code,
            message: message || this.getDefaultErrorMessage(code),
            attribute
        };
    }
    /**
     * Gets default error message for error type
     */
    getDefaultErrorMessage(code) {
        switch (code) {
            case types_1.AttributeErrorType.INVALID_NAME:
                return 'Invalid attribute name';
            case types_1.AttributeErrorType.INVALID_TYPE:
                return 'Invalid attribute type';
            case types_1.AttributeErrorType.RESERVED_WORD:
                return 'Attribute name is a reserved word';
            case types_1.AttributeErrorType.VALIDATION_ERROR:
                return 'Validation error';
            case types_1.AttributeErrorType.NO_ATTRIBUTES:
                return 'Table must have at least one attribute defined';
            case types_1.AttributeErrorType.INVALID_MIN_LENGTH:
                return 'minLength must be >= 0';
            case types_1.AttributeErrorType.INVALID_MAX_LENGTH:
                return 'maxLength must be >= minLength';
            case types_1.AttributeErrorType.INVALID_RANGE:
                return 'min must be <= max';
            case types_1.AttributeErrorType.INVALID_PERCENTAGE:
                return 'Percentage must be between 0 and 100';
            case types_1.AttributeErrorType.MISSING_ITEM_TYPE:
                return 'List attribute must specify itemType';
            case types_1.AttributeErrorType.INVALID_ITEM_TYPE:
                return 'Invalid item type for list';
            case types_1.AttributeErrorType.MISSING_ALLOWED_VALUES:
                return 'Status attribute must specify allowedValues';
            default:
                return 'Unknown error';
        }
    }
    /**
     * Validates table attributes definition and converts to DynamoDB format
     */
    validateTableAttributes(table) {
        const errors = [];
        if (!table.tableName || table.tableName.trim() === '') {
            errors.push(this.createError('tableName', types_1.AttributeErrorType.INVALID_NAME, 'Table name is required'));
            return { success: false, errors };
        }
        if (!table.attributes || Object.keys(table.attributes).length === 0) {
            errors.push(this.createError('attributes', types_1.AttributeErrorType.NO_ATTRIBUTES, 'At least one attribute is required'));
            return { success: false, errors };
        }
        // Convert domain attributes if needed
        const convertedTable = 'type' in table.attributes[Object.keys(table.attributes)[0]] ?
            {
                ...table, attributes: Object.entries(table.attributes).reduce((acc, [key, attr]) => ({
                    ...acc,
                    [key]: types_2.TypeConversion.toDynamoDBAttribute(attr)
                }), {})
            } : table;
        // Validate each attribute
        for (const [name, attr] of Object.entries(convertedTable.attributes)) {
            if (!this.isValidAttributeName(name)) {
                errors.push(this.createError(name, types_1.AttributeErrorType.RESERVED_WORD));
                continue;
            }
            errors.push(...this.validateAttributeDefinition(name, attr));
        }
        if (errors.length > 0) {
            return { success: false, errors };
        }
        return {
            success: true,
            data: convertedTable
        };
    }
    /**
     * Validates a single attribute definition
     */
    validateAttributeDefinition(name, attr) {
        const errors = [];
        // Validate attribute name
        if (!this.isValidAttributeName(name)) {
            errors.push(this.createError(name, types_1.AttributeErrorType.INVALID_NAME));
        }
        // Validate type
        if (!this.isValidDomainType(attr.type)) {
            errors.push(this.createError(name, types_1.AttributeErrorType.INVALID_TYPE));
        }
        // Validate type-specific constraints
        switch (attr.type) {
            case 'text':
            case 'longText':
                if (attr.minLength !== undefined && attr.minLength < 0) {
                    errors.push(this.createError(name, types_1.AttributeErrorType.INVALID_MIN_LENGTH));
                }
                if (attr.maxLength !== undefined && attr.minLength !== undefined && attr.maxLength < attr.minLength) {
                    errors.push(this.createError(name, types_1.AttributeErrorType.INVALID_MAX_LENGTH));
                }
                break;
            case 'number':
            case 'integer':
            case 'currency':
            case 'percentage':
                if (attr.min !== undefined && attr.max !== undefined && attr.min > attr.max) {
                    errors.push(this.createError(name, types_1.AttributeErrorType.INVALID_RANGE));
                }
                if (attr.type === 'percentage') {
                    const min = attr.min ?? 0;
                    const max = attr.max ?? 100;
                    if (min < 0 || max > 100) {
                        errors.push(this.createError(name, types_1.AttributeErrorType.INVALID_PERCENTAGE));
                    }
                }
                break;
            case 'list':
                if (!attr.itemType) {
                    errors.push(this.createError(name, types_1.AttributeErrorType.MISSING_ITEM_TYPE));
                }
                else if (!this.isValidDomainType(attr.itemType)) {
                    errors.push(this.createError(name, types_1.AttributeErrorType.INVALID_ITEM_TYPE));
                }
                break;
            case 'status':
                if (!attr.allowedValues || attr.allowedValues.length === 0) {
                    errors.push(this.createError(name, types_1.AttributeErrorType.MISSING_ALLOWED_VALUES));
                }
                break;
        }
        return errors;
    }
    /**
     * Validates attribute name format
     */
    isValidAttributeName(name) {
        return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(name);
    }
    /**
     * Validates domain type
     */
    isValidDomainType(type) {
        const validTypes = [
            'id', 'userId', 'productId', 'orderId',
            'text', 'longText', 'number', 'integer', 'boolean', 'binary',
            'email', 'phone', 'url', 'date', 'datetime',
            'list', 'map', 'stringSet', 'numberSet', 'tags',
            'timestamp', 'currency', 'percentage', 'status'
        ];
        return validTypes.includes(type);
    }
}
exports.AttributeValidator = AttributeValidator;
//# sourceMappingURL=validator.js.map