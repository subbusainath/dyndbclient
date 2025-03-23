"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanTable = scanTable;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const error_handler_1 = require("../core/error-handler");
/**
 * Scan table with options
 */
async function scanTable(client, tableName, options = {}) {
    try {
        const input = {
            TableName: tableName,
            FilterExpression: options.filter,
            ExpressionAttributeValues: options.expressionValues,
            ExpressionAttributeNames: options.expressionNames,
            ProjectionExpression: options.attributes?.join(', '),
            Limit: options.limit,
            ExclusiveStartKey: options.startKey,
            IndexName: options.indexName,
            ConsistentRead: options.consistent,
            TotalSegments: options.totalSegments,
            Segment: options.segment
        };
        const result = await client.send(new lib_dynamodb_1.ScanCommand(input));
        return {
            success: true,
            data: {
                items: result.Items || [],
                count: result.Count,
                scannedCount: result.ScannedCount,
                nextToken: result.LastEvaluatedKey
            }
        };
    }
    catch (error) {
        return (0, error_handler_1.handleError)('Failed to scan table', error);
    }
}
//# sourceMappingURL=scan.js.map