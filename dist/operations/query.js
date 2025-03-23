"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryTable = queryTable;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const reserved_words_1 = require("../core/reserved-words");
/**
 * Execute a query operation with automatic handling of reserved words
 */
async function queryTable(client, tableName, params) {
    try {
        const expressionHandler = new reserved_words_1.ExpressionAttributeHandler();
        // Process key condition expression
        const { keyConditionExpression, expressionAttributeNames: keyConditionNames } = expressionHandler.processKeyConditionExpression(params.keyCondition.expression);
        // Process projection expression if select is specified
        let projectionExpression;
        let projectionNames;
        if (params.select && params.select.length > 0) {
            const result = expressionHandler.processProjectionExpression(params.select);
            projectionExpression = result.projectionExpression;
            projectionNames = result.expressionAttributeNames;
        }
        // Process filter expression if specified
        let filterExpression;
        let filterNames;
        if (params.filter) {
            const result = expressionHandler.processKeyConditionExpression(params.filter.expression);
            filterExpression = result.keyConditionExpression;
            filterNames = result.expressionAttributeNames;
        }
        // Combine all expression attribute names
        const expressionAttributeNames = {
            ...keyConditionNames,
            ...projectionNames,
            ...filterNames
        };
        const command = new lib_dynamodb_1.QueryCommand({
            TableName: tableName,
            IndexName: params.indexName,
            KeyConditionExpression: keyConditionExpression,
            FilterExpression: filterExpression,
            ProjectionExpression: projectionExpression,
            ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0
                ? expressionAttributeNames
                : undefined,
            ExpressionAttributeValues: params.keyCondition.values || params.filter?.values
                ? {
                    ...(params.keyCondition.values || {}),
                    ...(params.filter?.values || {})
                }
                : undefined,
            Limit: params.limit,
            ScanIndexForward: params.scanIndexForward,
            ConsistentRead: params.consistentRead,
            ExclusiveStartKey: params.exclusiveStartKey
        });
        const response = await client.send(command);
        return {
            success: true,
            data: response.Items || [],
            lastEvaluatedKey: response.LastEvaluatedKey,
            count: response.Count,
            scannedCount: response.ScannedCount
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error : new Error('Unknown error during query operation')
        };
    }
}
//# sourceMappingURL=query.js.map