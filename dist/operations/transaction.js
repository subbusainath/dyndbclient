"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionOperationType = void 0;
exports.executeTransaction = executeTransaction;
exports.transactionGet = transactionGet;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const error_handler_1 = require("../core/error-handler");
/**
 * Types of transaction operations
 */
var TransactionOperationType;
(function (TransactionOperationType) {
    TransactionOperationType["Put"] = "Put";
    TransactionOperationType["Update"] = "Update";
    TransactionOperationType["Delete"] = "Delete";
    TransactionOperationType["ConditionCheck"] = "ConditionCheck";
})(TransactionOperationType || (exports.TransactionOperationType = TransactionOperationType = {}));
/**
 * Execute a transaction write with multiple operations
 */
async function executeTransaction(client, defaultTableName, operations) {
    try {
        const transactItems = operations.map(operation => {
            const tableName = operation.tableName || defaultTableName;
            let transactItem;
            // Handle each operation type separately with proper type casting
            if (operation.type === TransactionOperationType.Put) {
                const putOp = operation;
                transactItem = {
                    Put: {
                        TableName: tableName,
                        Item: putOp.item,
                        ConditionExpression: putOp.condition,
                        ExpressionAttributeValues: putOp.expressionValues
                    }
                };
            }
            else if (operation.type === TransactionOperationType.Update) {
                const updateOp = operation;
                transactItem = {
                    Update: {
                        TableName: tableName,
                        Key: updateOp.key,
                        UpdateExpression: updateOp.updateExpression,
                        ConditionExpression: updateOp.condition,
                        ExpressionAttributeValues: updateOp.expressionValues,
                        ExpressionAttributeNames: updateOp.expressionNames
                    }
                };
            }
            else if (operation.type === TransactionOperationType.Delete) {
                const deleteOp = operation;
                transactItem = {
                    Delete: {
                        TableName: tableName,
                        Key: deleteOp.key,
                        ConditionExpression: deleteOp.condition,
                        ExpressionAttributeValues: deleteOp.expressionValues
                    }
                };
            }
            else if (operation.type === TransactionOperationType.ConditionCheck) {
                const conditionOp = operation;
                transactItem = {
                    ConditionCheck: {
                        TableName: tableName,
                        Key: conditionOp.key,
                        ConditionExpression: conditionOp.conditionExpression,
                        ExpressionAttributeValues: conditionOp.expressionValues
                    }
                };
            }
            else {
                throw new Error(`Unsupported transaction operation type`);
            }
            return transactItem;
        });
        const input = {
            TransactItems: transactItems
        };
        await client.send(new lib_dynamodb_1.TransactWriteCommand(input));
        return {
            success: true,
            data: {
                // DynamoDB transactions don't return a transactionId
                // Use a placeholder value for the response
                transactionStatus: 'Executed',
                operationsCount: operations.length
            }
        };
    }
    catch (error) {
        return (0, error_handler_1.handleError)('Transaction execution failed', error);
    }
}
/**
 * Execute a transaction get for multiple items
 */
async function transactionGet(client, defaultTableName, items) {
    try {
        const transactItems = items.map(item => ({
            Get: {
                TableName: item.tableName || defaultTableName,
                Key: item.key
            }
        }));
        const input = {
            TransactItems: transactItems
        };
        const result = await client.send(new lib_dynamodb_1.TransactGetCommand(input));
        return {
            success: true,
            data: {
                items: result.Responses?.map(response => response.Item)
            }
        };
    }
    catch (error) {
        return (0, error_handler_1.handleError)('Transaction get failed', error);
    }
}
//# sourceMappingURL=transaction.js.map