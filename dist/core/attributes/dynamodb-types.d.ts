/**
 * Constants for DynamoDB attribute types and patterns
 */
/**
 * DynamoDB attribute types
 */
export declare const DynamoDBAttributeType: {
    readonly STRING: "S";
    readonly NUMBER: "N";
    readonly BINARY: "B";
    readonly BOOLEAN: "BOOL";
    readonly NULL: "NULL";
    readonly LIST: "L";
    readonly MAP: "M";
    readonly STRING_SET: "SS";
    readonly NUMBER_SET: "NS";
    readonly BINARY_SET: "BS";
};
/**
 * Common attribute patterns
 */
export declare const AttributePatterns: {
    readonly UUID: "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$";
    readonly USER_ID: "^usr_[0-9a-f]{24}$";
    readonly PRODUCT_ID: "^prod_[0-9a-f]{24}$";
    readonly ORDER_ID: "^ord_[0-9a-f]{24}$";
    readonly EMAIL: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$";
    readonly PHONE: "^\\+?[1-9]\\d{1,14}$";
    readonly URL: "^https?://[\\w\\d\\-._~:/?#\\[\\]@!$&'()*+,;=]+$";
    readonly ISO_DATE: "^\\d{4}-\\d{2}-\\d{2}$";
    readonly ISO_DATETIME: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?(Z|[+-]\\d{2}:?\\d{2})$";
    readonly TIME_24H: "^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$";
};
export type DynamoDBAttributeTypeValue = typeof DynamoDBAttributeType[keyof typeof DynamoDBAttributeType];
declare const SET_TYPES: readonly ["SS", "NS", "BS"];
/**
 * Helper functions to check attribute types
 */
export declare const AttributeTypeUtils: {
    isStringType: (type: DynamoDBAttributeTypeValue) => type is "S";
    isNumberType: (type: DynamoDBAttributeTypeValue) => type is "N";
    isBinaryType: (type: DynamoDBAttributeTypeValue) => type is "B";
    isBooleanType: (type: DynamoDBAttributeTypeValue) => type is "BOOL";
    isNullType: (type: DynamoDBAttributeTypeValue) => type is "NULL";
    isMapType: (type: DynamoDBAttributeTypeValue) => type is "M";
    isListType: (type: DynamoDBAttributeTypeValue) => type is "L";
    isStringSetType: (type: DynamoDBAttributeTypeValue) => type is "SS";
    isNumberSetType: (type: DynamoDBAttributeTypeValue) => type is "NS";
    isBinarySetType: (type: DynamoDBAttributeTypeValue) => type is "BS";
    isSetType: (type: DynamoDBAttributeTypeValue) => type is (typeof SET_TYPES)[number];
};
/**
 * Built-in attribute types with automatic validation
 */
export type DomainAttributeType = 'id' | 'userId' | 'productId' | 'orderId' | 'text' | 'longText' | 'number' | 'integer' | 'boolean' | 'binary' | 'email' | 'phone' | 'url' | 'date' | 'datetime' | 'list' | 'map' | 'stringSet' | 'numberSet' | 'tags' | 'timestamp' | 'currency' | 'percentage' | 'status';
export {};
