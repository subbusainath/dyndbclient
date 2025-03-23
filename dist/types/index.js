"use strict";
/**
 * Core types for the DynamoDB client wrapper
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryOperationType = exports.UpdateOperationType = exports.TypeConversion = void 0;
/**
 * Type conversion utilities
 */
var TypeConversion;
(function (TypeConversion) {
    function toDynamoDBAttribute(attr) {
        return {
            ...attr,
            type: attr.type || 'S' // Default to String type
        };
    }
    TypeConversion.toDynamoDBAttribute = toDynamoDBAttribute;
    function toDynamoDBValue(value) {
        if (value === undefined || value === null) {
            return null;
        }
        if (typeof value === 'string') {
            return { S: value };
        }
        if (typeof value === 'number') {
            return { N: value.toString() };
        }
        if (typeof value === 'boolean') {
            return { BOOL: value };
        }
        if (Array.isArray(value)) {
            if (value.every(item => typeof item === 'string')) {
                return { SS: value };
            }
            if (value.every(item => typeof item === 'number')) {
                return { NS: value.map(n => n.toString()) };
            }
            return { L: value.map(item => toDynamoDBValue(item)) };
        }
        if (typeof value === 'object') {
            return {
                M: Object.entries(value).reduce((acc, [key, val]) => ({
                    ...acc,
                    [key]: toDynamoDBValue(val)
                }), {})
            };
        }
        return { S: String(value) };
    }
    TypeConversion.toDynamoDBValue = toDynamoDBValue;
    function fromDynamoDBValue(dynamoValue) {
        if (!dynamoValue)
            return null;
        const type = Object.keys(dynamoValue)[0];
        const value = dynamoValue[type];
        switch (type) {
            case 'S':
                return value;
            case 'N':
                return Number(value);
            case 'BOOL':
                return value;
            case 'SS':
                return value;
            case 'NS':
                return value.map((n) => Number(n));
            case 'L':
                return value.map((item) => fromDynamoDBValue(item));
            case 'M':
                return Object.entries(value).reduce((acc, [key, val]) => ({
                    ...acc,
                    [key]: fromDynamoDBValue(val)
                }), {});
            default:
                return value;
        }
    }
    TypeConversion.fromDynamoDBValue = fromDynamoDBValue;
})(TypeConversion || (exports.TypeConversion = TypeConversion = {}));
var UpdateOperationType;
(function (UpdateOperationType) {
    UpdateOperationType["SET"] = "SET";
    UpdateOperationType["REMOVE"] = "REMOVE";
    UpdateOperationType["ADD"] = "ADD";
    UpdateOperationType["DELETE"] = "DELETE";
})(UpdateOperationType || (exports.UpdateOperationType = UpdateOperationType = {}));
var QueryOperationType;
(function (QueryOperationType) {
    QueryOperationType["EQUALS"] = "EQUALS";
    QueryOperationType["NOT_EQUALS"] = "NOT_EQUALS";
    QueryOperationType["GREATER_THAN"] = "GREATER_THAN";
    QueryOperationType["LESS_THAN"] = "LESS_THAN";
    QueryOperationType["CONTAINS"] = "CONTAINS";
    QueryOperationType["BEGINS_WITH"] = "BEGINS_WITH";
    QueryOperationType["IN"] = "IN";
    QueryOperationType["BETWEEN"] = "BETWEEN";
})(QueryOperationType || (exports.QueryOperationType = QueryOperationType = {}));
//# sourceMappingURL=index.js.map