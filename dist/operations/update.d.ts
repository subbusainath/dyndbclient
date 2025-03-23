import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { OperationResponse } from '../types/config';
export declare enum UpdateOperationType {
    SET = "SET",
    REMOVE = "REMOVE",
    ADD = "ADD",
    DELETE = "DELETE"
}
export interface FieldUpdate {
    field: string;
    value?: any;
    operation: UpdateOperationType;
}
export interface UpdateOptions {
    condition?: {
        expression: string;
        values?: Record<string, any>;
    };
    returnValues?: 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW';
}
/**
 * Builder class for constructing complex update expressions
 */
export declare class UpdateBuilder {
    private updates;
    constructor();
    /**
     * Set a field value
     */
    set(field: string, value: any): UpdateBuilder;
    /**
     * Remove a field
     */
    remove(field: string): UpdateBuilder;
    /**
     * Add a value to a number field or add elements to a set
     */
    add(field: string, value: any): UpdateBuilder;
    /**
     * Delete elements from a set
     */
    delete(field: string, value: any): UpdateBuilder;
    /**
     * Increment a number field by 1
     */
    increment(field: string): UpdateBuilder;
    /**
     * Decrement a number field by 1
     */
    decrement(field: string): UpdateBuilder;
    /**
     * Append items to a list
     */
    appendToList(field: string, items: any[]): UpdateBuilder;
    /**
     * Get all updates
     */
    getUpdates(): FieldUpdate[];
}
/**
 * Update an item in DynamoDB
 */
export declare function updateItem(client: DynamoDBDocumentClient, tableName: string, key: Record<string, any>, updates: FieldUpdate[] | UpdateBuilder, options?: UpdateOptions): Promise<OperationResponse>;
