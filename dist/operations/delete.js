"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = deleteItem;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const error_handler_1 = require("../core/error-handler");
/**
 * Delete an item by key
 */
async function deleteItem(client, tableName, key, options = {}) {
    try {
        const input = {
            TableName: tableName,
            Key: key,
            ConditionExpression: options.condition,
            ExpressionAttributeValues: options.expressionValues,
            ExpressionAttributeNames: options.expressionNames,
            ReturnValues: options.returnValues
        };
        const result = await client.send(new lib_dynamodb_1.DeleteCommand(input));
        return {
            success: true,
            data: result.Attributes || null
        };
    }
    catch (error) {
        return (0, error_handler_1.handleError)('Failed to delete item', error);
    }
}
//# sourceMappingURL=delete.js.map