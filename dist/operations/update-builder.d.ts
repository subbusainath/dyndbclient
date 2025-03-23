import { FieldUpdate } from '../types';
/**
 * Builder class for creating update operations with a fluent interface
 */
export declare class UpdateBuilder {
    private updates;
    private readonly MAX_UPDATES;
    /**
     * Validate field name
     */
    private validateFieldName;
    /**
     * Validate value
     */
    private validateValue;
    /**
     * Set a field value
     */
    set(field: string, value: any): UpdateBuilder;
    /**
     * Remove a field
     */
    remove(field: string): UpdateBuilder;
    /**
     * Add a value to a set
     */
    addToSet(field: string, value: any): UpdateBuilder;
    /**
     * Remove a value from a set
     */
    removeFromSet(field: string, value: any): UpdateBuilder;
    /**
     * Increment a number field
     */
    increment(field: string, value: number): UpdateBuilder;
    /**
     * Decrement a number field
     */
    decrement(field: string, value: number): UpdateBuilder;
    /**
     * Append to a list
     */
    appendToList(field: string, value: any): UpdateBuilder;
    /**
     * Prepend to a list
     */
    prependToList(field: string, value: any): UpdateBuilder;
    /**
     * Get the built updates
     */
    build(): FieldUpdate[];
}
