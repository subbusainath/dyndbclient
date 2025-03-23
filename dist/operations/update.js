"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBuilder = exports.UpdateOperationType = void 0;
exports.updateItem = updateItem;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const reserved_words_1 = require("../core/reserved-words");
var UpdateOperationType;
(function (UpdateOperationType) {
    UpdateOperationType["SET"] = "SET";
    UpdateOperationType["REMOVE"] = "REMOVE";
    UpdateOperationType["ADD"] = "ADD";
    UpdateOperationType["DELETE"] = "DELETE";
})(UpdateOperationType || (exports.UpdateOperationType = UpdateOperationType = {}));
/**
 * Builder class for constructing complex update expressions
 */
class UpdateBuilder {
    constructor() {
        this.updates = [];
    }
    /**
     * Set a field value
     */
    set(field, value) {
        this.updates.push({
            field,
            value,
            operation: UpdateOperationType.SET
        });
        return this;
    }
    /**
     * Remove a field
     */
    remove(field) {
        this.updates.push({
            field,
            operation: UpdateOperationType.REMOVE
        });
        return this;
    }
    /**
     * Add a value to a number field or add elements to a set
     */
    add(field, value) {
        this.updates.push({
            field,
            value,
            operation: UpdateOperationType.ADD
        });
        return this;
    }
    /**
     * Delete elements from a set
     */
    delete(field, value) {
        this.updates.push({
            field,
            value,
            operation: UpdateOperationType.DELETE
        });
        return this;
    }
    /**
     * Increment a number field by 1
     */
    increment(field) {
        return this.add(field, 1);
    }
    /**
     * Decrement a number field by 1
     */
    decrement(field) {
        return this.add(field, -1);
    }
    /**
     * Append items to a list
     */
    appendToList(field, items) {
        return this.set(field, `list_append(if_not_exists(${field}, :empty_list), :items)`)
            .set(':empty_list', [])
            .set(':items', items);
    }
    /**
     * Get all updates
     */
    getUpdates() {
        return this.updates;
    }
}
exports.UpdateBuilder = UpdateBuilder;
/**
 * Update an item in DynamoDB
 */
async function updateItem(client, tableName, key, updates, options = {}) {
    try {
        const expressionHandler = new reserved_words_1.ExpressionAttributeHandler();
        const updateArray = updates instanceof UpdateBuilder ? updates.getUpdates() : updates;
        // Group updates by operation type
        const groupedUpdates = updateArray.reduce((acc, update) => {
            if (!acc[update.operation]) {
                acc[update.operation] = [];
            }
            acc[update.operation].push(update);
            return acc;
        }, {});
        // Build update expression parts
        const expressionParts = [];
        const expressionValues = {};
        let valueCounter = 0;
        Object.entries(groupedUpdates).forEach(([operation, updates]) => {
            if (updates.length === 0)
                return;
            const updateParts = updates.map(update => {
                const fieldName = expressionHandler.getExpressionAttributeName(update.field);
                if (update.value !== undefined) {
                    const placeholder = `:val${++valueCounter}`;
                    // Handle special list append/prepend operations
                    if (update.operation === UpdateOperationType.SET &&
                        typeof update.value === 'object' && update.value !== null) {
                        // List append operation
                        if (update.value.__listAppend) {
                            const itemsPlaceholder = `:items${valueCounter}`;
                            const emptyListPlaceholder = `:empty${valueCounter}`;
                            expressionValues[itemsPlaceholder] = update.value.items;
                            expressionValues[emptyListPlaceholder] = [];
                            return `${fieldName} = list_append(if_not_exists(${fieldName}, ${emptyListPlaceholder}), ${itemsPlaceholder})`;
                        }
                        // List prepend operation
                        if (update.value.__listPrepend) {
                            const itemsPlaceholder = `:items${valueCounter}`;
                            const emptyListPlaceholder = `:empty${valueCounter}`;
                            expressionValues[itemsPlaceholder] = update.value.items;
                            expressionValues[emptyListPlaceholder] = [];
                            return `${fieldName} = list_append(${itemsPlaceholder}, if_not_exists(${fieldName}, ${emptyListPlaceholder}))`;
                        }
                    }
                    // Default handling for normal values
                    expressionValues[placeholder] = update.value;
                    // Different format based on operation type
                    if (operation === UpdateOperationType.SET) {
                        return `${fieldName} = ${placeholder}`;
                    }
                    else if (operation === UpdateOperationType.ADD || operation === UpdateOperationType.DELETE) {
                        return `${fieldName} ${placeholder}`;
                    }
                    else {
                        return fieldName;
                    }
                }
                return fieldName;
            });
            expressionParts.push(`${operation} ${updateParts.join(', ')}`);
        });
        // Add condition values if present
        if (options.condition?.values) {
            Object.entries(options.condition.values).forEach(([key, value]) => {
                expressionValues[key] = value;
            });
        }
        const command = new lib_dynamodb_1.UpdateCommand({
            TableName: tableName,
            Key: key,
            UpdateExpression: expressionParts.join(' '),
            ExpressionAttributeNames: expressionHandler.getExpressionAttributeNames(),
            ExpressionAttributeValues: Object.keys(expressionValues).length > 0 ? expressionValues : undefined,
            ConditionExpression: options.condition?.expression,
            ReturnValues: options.returnValues
        });
        const response = await client.send(command);
        return {
            success: true,
            data: response.Attributes
        };
    }
    catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error : new Error('Unknown error during update operation')
        };
    }
}
//# sourceMappingURL=update.js.map