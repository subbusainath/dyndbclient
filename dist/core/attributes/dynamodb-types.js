"use strict";
/**
 * Constants for DynamoDB attribute types and patterns
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttributeTypeUtils = exports.AttributePatterns = exports.DynamoDBAttributeType = void 0;
/**
 * DynamoDB attribute types
 */
exports.DynamoDBAttributeType = {
    STRING: 'S',
    NUMBER: 'N',
    BINARY: 'B',
    BOOLEAN: 'BOOL',
    NULL: 'NULL',
    LIST: 'L',
    MAP: 'M',
    STRING_SET: 'SS',
    NUMBER_SET: 'NS',
    BINARY_SET: 'BS'
};
/**
 * Common attribute patterns
 */
exports.AttributePatterns = {
    // Identity patterns
    UUID: '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
    USER_ID: '^usr_[0-9a-f]{24}$',
    PRODUCT_ID: '^prod_[0-9a-f]{24}$',
    ORDER_ID: '^ord_[0-9a-f]{24}$',
    // Validation patterns
    EMAIL: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
    PHONE: '^\\+?[1-9]\\d{1,14}$',
    URL: '^https?://[\\w\\d\\-._~:/?#\\[\\]@!$&\'()*+,;=]+$',
    ISO_DATE: '^\\d{4}-\\d{2}-\\d{2}$',
    ISO_DATETIME: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?(Z|[+-]\\d{2}:?\\d{2})$',
    TIME_24H: '^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$' // HH:MM:SS format
};
// Set types constant
const SET_TYPES = [exports.DynamoDBAttributeType.STRING_SET, exports.DynamoDBAttributeType.NUMBER_SET, exports.DynamoDBAttributeType.BINARY_SET];
/**
 * Helper functions to check attribute types
 */
exports.AttributeTypeUtils = {
    isStringType: (type) => type === exports.DynamoDBAttributeType.STRING,
    isNumberType: (type) => type === exports.DynamoDBAttributeType.NUMBER,
    isBinaryType: (type) => type === exports.DynamoDBAttributeType.BINARY,
    isBooleanType: (type) => type === exports.DynamoDBAttributeType.BOOLEAN,
    isNullType: (type) => type === exports.DynamoDBAttributeType.NULL,
    isMapType: (type) => type === exports.DynamoDBAttributeType.MAP,
    isListType: (type) => type === exports.DynamoDBAttributeType.LIST,
    isStringSetType: (type) => type === exports.DynamoDBAttributeType.STRING_SET,
    isNumberSetType: (type) => type === exports.DynamoDBAttributeType.NUMBER_SET,
    isBinarySetType: (type) => type === exports.DynamoDBAttributeType.BINARY_SET,
    isSetType: (type) => SET_TYPES.includes(type)
};
//# sourceMappingURL=dynamodb-types.js.map