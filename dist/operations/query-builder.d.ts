import { QueryCondition } from '../types';
/**
 * Builder class for creating query operations with a fluent interface
 */
export declare class QueryBuilder {
    private conditions;
    private indexName?;
    private limit?;
    private selectedFields?;
    private readonly MAX_LIMIT;
    private readonly MAX_CONDITIONS;
    /**
     * Validate field name
     */
    private validateFieldName;
    /**
     * Validate value
     */
    private validateValue;
    /**
     * Validate index name
     */
    private validateIndexName;
    /**
     * Set the index to use for the query
     */
    usingIndex(indexName: string): QueryBuilder;
    /**
     * Set the maximum number of results to return
     */
    withLimit(limit: number): QueryBuilder;
    /**
     * Set the fields to select
     */
    selectFields(fields: string[]): QueryBuilder;
    /**
     * Add an equals condition
     */
    equals(field: string, value: any): QueryBuilder;
    /**
     * Add a not equals condition
     */
    notEquals(field: string, value: any): QueryBuilder;
    /**
     * Add a greater than condition
     */
    greaterThan(field: string, value: number): QueryBuilder;
    /**
     * Add a less than condition
     */
    lessThan(field: string, value: number): QueryBuilder;
    /**
     * Add a contains condition
     */
    contains(field: string, value: any): QueryBuilder;
    /**
     * Add a begins with condition
     */
    beginsWith(field: string, value: string): QueryBuilder;
    /**
     * Add an in condition
     */
    in(field: string, values: any[]): QueryBuilder;
    /**
     * Add a between condition
     */
    between(field: string, start: number, end: number): QueryBuilder;
    /**
     * Get the built query parameters
     */
    build(): {
        conditions: QueryCondition[];
        indexName?: string;
        limit?: number;
        select?: string[];
        keyCondition: {
            expression: string;
            values: Record<string, any>;
        };
    };
}
