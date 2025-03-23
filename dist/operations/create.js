"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItem = createItem;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
/**
 * Create a new item in DynamoDB
 */
async function createItem(client, tableName, item, options = {}) {
    try {
        const command = new lib_dynamodb_1.PutCommand({
            TableName: tableName,
            Item: item,
            ConditionExpression: options.conditionExpression,
            ExpressionAttributeNames: options.expressionAttributeNames,
            ExpressionAttributeValues: options.expressionAttributeValues,
            ReturnValues: options.returnValues,
            ReturnConsumedCapacity: options.returnConsumedCapacity,
            ReturnItemCollectionMetrics: options.returnItemCollectionMetrics
        });
        const response = await client.send(command);
        return {
            success: true,
            data: response.Attributes,
            consumedCapacity: response.ConsumedCapacity
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error : new Error('Unknown error during create operation')
        };
    }
}
//# sourceMappingURL=create.js.map