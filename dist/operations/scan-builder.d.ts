import { ScanOptions } from './scan';
/**
 * Builder for creating DynamoDB scan operations
 *
 * This class provides a fluent interface for building scan operations,
 * allowing for cleaner and more maintainable code when working with
 * complex scan conditions.
 */
export declare class ScanBuilder {
    private filterExpressions;
    private expressionValues;
    private expressionNames;
    private selectedFields?;
    private limitValue?;
    private indexNameValue?;
    private consistentReadValue?;
    private startKeyValue?;
    private totalSegmentsValue?;
    private segmentValue?;
    private valueCounter;
    /**
     * Create a new scan builder
     */
    constructor();
    /**
     * Add a filter expression for a field equals a value
     */
    equals(field: string, value: any): ScanBuilder;
    /**
     * Add a filter expression for a field not equals a value
     */
    notEquals(field: string, value: any): ScanBuilder;
    /**
     * Add a filter expression for a field less than a value
     */
    lessThan(field: string, value: number | string): ScanBuilder;
    /**
     * Add a filter expression for a field less than or equal to a value
     */
    lessThanOrEqual(field: string, value: number | string): ScanBuilder;
    /**
     * Add a filter expression for a field greater than a value
     */
    greaterThan(field: string, value: number | string): ScanBuilder;
    /**
     * Add a filter expression for a field greater than or equal to a value
     */
    greaterThanOrEqual(field: string, value: number | string): ScanBuilder;
    /**
     * Add a filter expression for a field beginning with a value
     */
    beginsWith(field: string, value: string): ScanBuilder;
    /**
     * Add a filter expression for a field containing a value
     */
    contains(field: string, value: string): ScanBuilder;
    /**
     * Add a filter expression for a field being between two values
     */
    between(field: string, lowerValue: number | string, upperValue: number | string): ScanBuilder;
    /**
     * Add a filter expression for a field existing
     */
    attributeExists(field: string): ScanBuilder;
    /**
     * Add a filter expression for a field not existing
     */
    attributeNotExists(field: string): ScanBuilder;
    /**
     * Add a custom filter expression
     */
    filter(expression: string, values?: Record<string, any>): ScanBuilder;
    /**
     * Specify which fields to return in the results
     */
    selectFields(fields: string[]): ScanBuilder;
    /**
     * Specify the maximum number of items to return
     */
    withLimit(limit: number): ScanBuilder;
    /**
     * Specify a secondary index to scan
     */
    usingIndex(indexName: string): ScanBuilder;
    /**
     * Enable consistent read for this scan
     */
    withConsistentRead(consistent: boolean): ScanBuilder;
    /**
     * Set the exclusive start key for pagination
     */
    withStartKey(startKey: Record<string, any>): ScanBuilder;
    /**
     * Configure parallel scan by setting total segments
     */
    withParallelScan(totalSegments: number, segment: number): ScanBuilder;
    /**
     * Build the scan options
     */
    build(): ScanOptions;
    /**
     * Helper method to add a condition to the filter expression
     */
    private addCondition;
    /**
     * Helper method to get or create an expression attribute name
     */
    private getExpressionName;
}
