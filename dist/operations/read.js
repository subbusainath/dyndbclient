"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readItem = readItem;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const reserved_words_1 = require("../core/reserved-words");
/**
 * Read an item from DynamoDB with automatic handling of reserved words
 */
async function readItem(client, tableName, key, options) {
    try {
        const expressionHandler = new reserved_words_1.ExpressionAttributeHandler();
        // Process projection expression if select is specified
        let projectionExpression;
        let expressionAttributeNames;
        if (options?.select && options.select.length > 0) {
            const result = expressionHandler.processProjectionExpression(options.select);
            projectionExpression = result.projectionExpression;
            expressionAttributeNames = result.expressionAttributeNames;
        }
        const command = new lib_dynamodb_1.GetCommand({
            TableName: tableName,
            Key: key,
            ProjectionExpression: projectionExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ConsistentRead: options?.consistentRead
        });
        const response = await client.send(command);
        return {
            success: true,
            data: response.Item || null
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error : new Error('Unknown error during read operation')
        };
    }
}
//# sourceMappingURL=read.js.map