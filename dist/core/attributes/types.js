"use strict";
/**
 * Types for DynamoDB attribute management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeConversion = exports.AttributeErrorType = void 0;
/**
 * Attribute error types
 */
var AttributeErrorType;
(function (AttributeErrorType) {
    AttributeErrorType["INVALID_NAME"] = "INVALID_NAME";
    AttributeErrorType["INVALID_TYPE"] = "INVALID_TYPE";
    AttributeErrorType["RESERVED_WORD"] = "RESERVED_WORD";
    AttributeErrorType["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    AttributeErrorType["NO_ATTRIBUTES"] = "NO_ATTRIBUTES";
    AttributeErrorType["INVALID_MIN_LENGTH"] = "INVALID_MIN_LENGTH";
    AttributeErrorType["INVALID_MAX_LENGTH"] = "INVALID_MAX_LENGTH";
    AttributeErrorType["INVALID_RANGE"] = "INVALID_RANGE";
    AttributeErrorType["INVALID_PERCENTAGE"] = "INVALID_PERCENTAGE";
    AttributeErrorType["MISSING_ITEM_TYPE"] = "MISSING_ITEM_TYPE";
    AttributeErrorType["INVALID_ITEM_TYPE"] = "INVALID_ITEM_TYPE";
    AttributeErrorType["MISSING_ALLOWED_VALUES"] = "MISSING_ALLOWED_VALUES";
})(AttributeErrorType || (exports.AttributeErrorType = AttributeErrorType = {}));
/**
 * Type conversion utilities
 */
exports.TypeConversion = {
    /**
     * Maps domain type to DynamoDB type
     */
    toDynamoDBType(type) {
        const typeMap = {
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
            status: 'S'
        };
        return typeMap[type];
    },
    /**
     * Converts domain attribute to DynamoDB attribute
     */
    toDynamoDBAttribute(attr) {
        return {
            ...attr,
            type: this.toDynamoDBType(attr.type),
            itemType: attr.itemType ? this.toDynamoDBType(attr.itemType) : undefined
        };
    }
};
//# sourceMappingURL=types.js.map