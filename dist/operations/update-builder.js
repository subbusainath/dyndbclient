"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBuilder = void 0;
const types_1 = require("../types");
/**
 * Builder class for creating update operations with a fluent interface
 */
class UpdateBuilder {
    constructor() {
        this.updates = [];
        this.MAX_UPDATES = 100; // DynamoDB limit for update expressions
    }
    /**
     * Validate field name
     */
    validateFieldName(field) {
        if (!field || typeof field !== 'string') {
            throw new Error('Field name must be a non-empty string');
        }
        // Prevent NoSQL injection by validating field name format
        if (!/^[a-zA-Z0-9_]+$/.test(field)) {
            throw new Error('Field name can only contain alphanumeric characters and underscores');
        }
    }
    /**
     * Validate value
     */
    validateValue(value) {
        if (value === undefined || value === null) {
            throw new Error('Value cannot be undefined or null');
        }
        // Prevent large values that could cause issues
        if (typeof value === 'string' && value.length > 400000) {
            throw new Error('String value exceeds maximum length of 400KB');
        }
    }
    /**
     * Set a field value
     */
    set(field, value) {
        this.validateFieldName(field);
        this.validateValue(value);
        if (this.updates.length >= this.MAX_UPDATES) {
            throw new Error(`Maximum number of updates (${this.MAX_UPDATES}) exceeded`);
        }
        this.updates.push({
            field,
            value,
            operation: types_1.UpdateOperationType.SET
        });
        return this;
    }
    /**
     * Remove a field
     */
    remove(field) {
        this.validateFieldName(field);
        if (this.updates.length >= this.MAX_UPDATES) {
            throw new Error(`Maximum number of updates (${this.MAX_UPDATES}) exceeded`);
        }
        this.updates.push({
            field,
            operation: types_1.UpdateOperationType.REMOVE
        });
        return this;
    }
    /**
     * Add a value to a set
     */
    addToSet(field, value) {
        this.validateFieldName(field);
        this.validateValue(value);
        if (this.updates.length >= this.MAX_UPDATES) {
            throw new Error(`Maximum number of updates (${this.MAX_UPDATES}) exceeded`);
        }
        this.updates.push({
            field,
            value,
            operation: types_1.UpdateOperationType.ADD
        });
        return this;
    }
    /**
     * Remove a value from a set
     */
    removeFromSet(field, value) {
        this.validateFieldName(field);
        this.validateValue(value);
        if (this.updates.length >= this.MAX_UPDATES) {
            throw new Error(`Maximum number of updates (${this.MAX_UPDATES}) exceeded`);
        }
        this.updates.push({
            field,
            value,
            operation: types_1.UpdateOperationType.DELETE
        });
        return this;
    }
    /**
     * Increment a number field
     */
    increment(field, value) {
        this.validateFieldName(field);
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Value must be a valid number');
        }
        if (this.updates.length >= this.MAX_UPDATES) {
            throw new Error(`Maximum number of updates (${this.MAX_UPDATES}) exceeded`);
        }
        this.updates.push({
            field,
            value,
            operation: types_1.UpdateOperationType.ADD
        });
        return this;
    }
    /**
     * Decrement a number field
     */
    decrement(field, value) {
        this.validateFieldName(field);
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Value must be a valid number');
        }
        if (this.updates.length >= this.MAX_UPDATES) {
            throw new Error(`Maximum number of updates (${this.MAX_UPDATES}) exceeded`);
        }
        this.updates.push({
            field,
            value: -value,
            operation: types_1.UpdateOperationType.ADD
        });
        return this;
    }
    /**
     * Append to a list
     */
    appendToList(field, value) {
        this.validateFieldName(field);
        this.validateValue(value);
        if (this.updates.length >= this.MAX_UPDATES) {
            throw new Error(`Maximum number of updates (${this.MAX_UPDATES}) exceeded`);
        }
        // Use a SET operation with list_append instead of ADD operation
        // DynamoDB ADD doesn't work with lists, only with numbers and sets
        this.updates.push({
            field,
            // Create a DynamoDB list_append expression that will be handled
            // by a custom processor in the update function
            value: { __listAppend: true, items: [value] },
            operation: types_1.UpdateOperationType.SET
        });
        return this;
    }
    /**
     * Prepend to a list
     */
    prependToList(field, value) {
        this.validateFieldName(field);
        this.validateValue(value);
        if (this.updates.length >= this.MAX_UPDATES) {
            throw new Error(`Maximum number of updates (${this.MAX_UPDATES}) exceeded`);
        }
        // Use a SET operation with list_append instead of ADD operation
        // DynamoDB ADD doesn't work with lists, only with numbers and sets
        this.updates.push({
            field,
            // Create a DynamoDB list_append expression that will be handled
            // by a custom processor in the update function
            value: { __listPrepend: true, items: [value] },
            operation: types_1.UpdateOperationType.SET
        });
        return this;
    }
    /**
     * Get the built updates
     */
    build() {
        if (this.updates.length === 0) {
            throw new Error('No updates specified');
        }
        return this.updates;
    }
}
exports.UpdateBuilder = UpdateBuilder;
//# sourceMappingURL=update-builder.js.map