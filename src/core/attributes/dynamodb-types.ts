/**
 * Constants for DynamoDB attribute types and patterns
 */

/**
 * DynamoDB attribute types
 */
export const DynamoDBAttributeType = {
  STRING: 'S',
  NUMBER: 'N',
  BINARY: 'B',
  BOOLEAN: 'BOOL',
  NULL: 'NULL',
  LIST: 'L',
  MAP: 'M',
  STRING_SET: 'SS',
  NUMBER_SET: 'NS',
  BINARY_SET: 'BS',
} as const;

/**
 * Common attribute patterns
 */
export const AttributePatterns = {
  // Identity patterns
  UUID: '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
  USER_ID: '^usr_[0-9a-f]{24}$',
  PRODUCT_ID: '^prod_[0-9a-f]{24}$',
  ORDER_ID: '^ord_[0-9a-f]{24}$',

  // Validation patterns
  EMAIL: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  PHONE: '^\\+?[1-9]\\d{1,14}$',
  URL: "^https?://[\\w\\d\\-._~:/?#\\[\\]@!$&'()*+,;=]+$",
  ISO_DATE: '^\\d{4}-\\d{2}-\\d{2}$',
  ISO_DATETIME: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?(Z|[+-]\\d{2}:?\\d{2})$',
  TIME_24H: '^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$', // HH:MM:SS format
} as const;

// Type for the DynamoDB attribute type values
export type DynamoDBAttributeTypeValue =
  (typeof DynamoDBAttributeType)[keyof typeof DynamoDBAttributeType];

// Set types constant
const SET_TYPES = [
  DynamoDBAttributeType.STRING_SET,
  DynamoDBAttributeType.NUMBER_SET,
  DynamoDBAttributeType.BINARY_SET,
] as const;

/**
 * Helper functions to check attribute types
 */
export const AttributeTypeUtils = {
  isStringType: (type: DynamoDBAttributeTypeValue) => type === DynamoDBAttributeType.STRING,
  isNumberType: (type: DynamoDBAttributeTypeValue) => type === DynamoDBAttributeType.NUMBER,
  isBinaryType: (type: DynamoDBAttributeTypeValue) => type === DynamoDBAttributeType.BINARY,
  isBooleanType: (type: DynamoDBAttributeTypeValue) => type === DynamoDBAttributeType.BOOLEAN,
  isNullType: (type: DynamoDBAttributeTypeValue) => type === DynamoDBAttributeType.NULL,
  isMapType: (type: DynamoDBAttributeTypeValue) => type === DynamoDBAttributeType.MAP,
  isListType: (type: DynamoDBAttributeTypeValue) => type === DynamoDBAttributeType.LIST,
  isStringSetType: (type: DynamoDBAttributeTypeValue) => type === DynamoDBAttributeType.STRING_SET,
  isNumberSetType: (type: DynamoDBAttributeTypeValue) => type === DynamoDBAttributeType.NUMBER_SET,
  isBinarySetType: (type: DynamoDBAttributeTypeValue) => type === DynamoDBAttributeType.BINARY_SET,
  isSetType: (type: DynamoDBAttributeTypeValue): type is (typeof SET_TYPES)[number] =>
    SET_TYPES.includes(type as any),
};

/**
 * Built-in attribute types with automatic validation
 */
export type DomainAttributeType =
  // Identity types
  | 'id' // Generic ID with UUID format
  | 'userId' // User ID with specific format
  | 'productId' // Product ID with specific format
  | 'orderId' // Order ID with specific format

  // Basic types
  | 'text' // Short text without validation
  | 'longText' // Long text with configurable length
  | 'number' // Any number
  | 'integer' // Whole numbers only
  | 'boolean' // True/false
  | 'binary' // Binary data

  // Validated types
  | 'email' // Email with validation
  | 'phone' // Phone number with validation
  | 'url' // URL with validation
  | 'date' // ISO date
  | 'datetime' // ISO datetime

  // Complex types
  | 'list' // Array of items
  | 'map' // Nested object
  | 'stringSet' // Set of unique strings
  | 'numberSet' // Set of unique numbers
  | 'tags' // Array of string tags

  // Special types
  | 'timestamp' // Unix timestamp
  | 'currency' // Monetary value
  | 'percentage' // 0-100 number
  | 'status'; // String with predefined values
