import { QueryOperationType, QueryCondition } from '../types';

/**
 * Builder class for creating query operations with a fluent interface
 */
export class QueryBuilder {
  private conditions: QueryCondition[] = [];
  private indexName?: string;
  private limit?: number;
  private selectedFields?: string[];
  private readonly MAX_LIMIT = 1000; // DynamoDB limit for query results
  private readonly MAX_CONDITIONS = 100; // DynamoDB limit for filter expressions

  /**
   * Validate field name
   */
  private validateFieldName(field: string): void {
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
  private validateValue(value: any): void {
    if (value === undefined || value === null) {
      throw new Error('Value cannot be undefined or null');
    }
    // Prevent large values that could cause issues
    if (typeof value === 'string' && value.length > 400000) {
      throw new Error('String value exceeds maximum length of 400KB');
    }
  }

  /**
   * Validate index name
   */
  private validateIndexName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Index name must be a non-empty string');
    }
    // Prevent NoSQL injection by validating index name format
    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      throw new Error('Index name can only contain alphanumeric characters and underscores');
    }
  }

  /**
   * Set the index to use for the query
   */
  usingIndex(indexName: string): QueryBuilder {
    this.validateIndexName(indexName);
    this.indexName = indexName;
    return this;
  }

  /**
   * Set the maximum number of results to return
   */
  withLimit(limit: number): QueryBuilder {
    if (typeof limit !== 'number' || limit < 1 || limit > this.MAX_LIMIT) {
      throw new Error(`Limit must be a number between 1 and ${this.MAX_LIMIT}`);
    }
    this.limit = limit;
    return this;
  }

  /**
   * Set the fields to select
   */
  selectFields(fields: string[]): QueryBuilder {
    if (!Array.isArray(fields) || fields.length === 0) {
      throw new Error('Fields must be a non-empty array');
    }
    fields.forEach(field => this.validateFieldName(field));
    this.selectedFields = fields;
    return this;
  }

  /**
   * Add an equals condition
   */
  equals(field: string, value: any): QueryBuilder {
    this.validateFieldName(field);
    this.validateValue(value);

    if (this.conditions.length >= this.MAX_CONDITIONS) {
      throw new Error(`Maximum number of conditions (${this.MAX_CONDITIONS}) exceeded`);
    }

    this.conditions.push({
      field,
      value,
      operation: QueryOperationType.EQUALS,
    });
    return this;
  }

  /**
   * Add a not equals condition
   */
  notEquals(field: string, value: any): QueryBuilder {
    this.validateFieldName(field);
    this.validateValue(value);

    if (this.conditions.length >= this.MAX_CONDITIONS) {
      throw new Error(`Maximum number of conditions (${this.MAX_CONDITIONS}) exceeded`);
    }

    this.conditions.push({
      field,
      value,
      operation: QueryOperationType.NOT_EQUALS,
    });
    return this;
  }

  /**
   * Add a greater than condition
   */
  greaterThan(field: string, value: number): QueryBuilder {
    this.validateFieldName(field);

    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Value must be a valid number');
    }

    if (this.conditions.length >= this.MAX_CONDITIONS) {
      throw new Error(`Maximum number of conditions (${this.MAX_CONDITIONS}) exceeded`);
    }

    this.conditions.push({
      field,
      value,
      operation: QueryOperationType.GREATER_THAN,
    });
    return this;
  }

  /**
   * Add a less than condition
   */
  lessThan(field: string, value: number): QueryBuilder {
    this.validateFieldName(field);

    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Value must be a valid number');
    }

    if (this.conditions.length >= this.MAX_CONDITIONS) {
      throw new Error(`Maximum number of conditions (${this.MAX_CONDITIONS}) exceeded`);
    }

    this.conditions.push({
      field,
      value,
      operation: QueryOperationType.LESS_THAN,
    });
    return this;
  }

  /**
   * Add a contains condition
   */
  contains(field: string, value: any): QueryBuilder {
    this.validateFieldName(field);
    this.validateValue(value);

    if (this.conditions.length >= this.MAX_CONDITIONS) {
      throw new Error(`Maximum number of conditions (${this.MAX_CONDITIONS}) exceeded`);
    }

    this.conditions.push({
      field,
      value,
      operation: QueryOperationType.CONTAINS,
    });
    return this;
  }

  /**
   * Add a begins with condition
   */
  beginsWith(field: string, value: string): QueryBuilder {
    this.validateFieldName(field);

    if (typeof value !== 'string') {
      throw new Error('Value must be a string');
    }

    if (this.conditions.length >= this.MAX_CONDITIONS) {
      throw new Error(`Maximum number of conditions (${this.MAX_CONDITIONS}) exceeded`);
    }

    this.conditions.push({
      field,
      value,
      operation: QueryOperationType.BEGINS_WITH,
    });
    return this;
  }

  /**
   * Add an in condition
   */
  in(field: string, values: any[]): QueryBuilder {
    this.validateFieldName(field);

    if (!Array.isArray(values) || values.length === 0) {
      throw new Error('Values must be a non-empty array');
    }

    values.forEach(value => this.validateValue(value));

    if (this.conditions.length >= this.MAX_CONDITIONS) {
      throw new Error(`Maximum number of conditions (${this.MAX_CONDITIONS}) exceeded`);
    }

    this.conditions.push({
      field,
      value: values,
      operation: QueryOperationType.IN,
    });
    return this;
  }

  /**
   * Add a between condition
   */
  between(field: string, start: number, end: number): QueryBuilder {
    this.validateFieldName(field);

    if (typeof start !== 'number' || typeof end !== 'number' || isNaN(start) || isNaN(end)) {
      throw new Error('Start and end values must be valid numbers');
    }

    if (start > end) {
      throw new Error('Start value must be less than or equal to end value');
    }

    if (this.conditions.length >= this.MAX_CONDITIONS) {
      throw new Error(`Maximum number of conditions (${this.MAX_CONDITIONS}) exceeded`);
    }

    this.conditions.push({
      field,
      value: [start, end],
      operation: QueryOperationType.BETWEEN,
    });
    return this;
  }

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
  } {
    if (this.conditions.length === 0) {
      throw new Error('No conditions specified');
    }

    // Extract the first condition as the key condition
    const keyCondition = this.conditions[0];
    let keyConditionExpression = '';
    const keyConditionValues: Record<string, any> = {};

    // Build the key condition expression
    switch (keyCondition.operation) {
      case QueryOperationType.EQUALS:
        keyConditionExpression = `${keyCondition.field} = :keyValue`;
        keyConditionValues[':keyValue'] = keyCondition.value;
        break;
      case QueryOperationType.BEGINS_WITH:
        keyConditionExpression = `begins_with(${keyCondition.field}, :keyValue)`;
        keyConditionValues[':keyValue'] = keyCondition.value;
        break;
      case QueryOperationType.BETWEEN:
        keyConditionExpression = `${keyCondition.field} BETWEEN :start AND :end`;
        keyConditionValues[':start'] = keyCondition.value[0];
        keyConditionValues[':end'] = keyCondition.value[1];
        break;
      default:
        keyConditionExpression = `${keyCondition.field} = :keyValue`;
        keyConditionValues[':keyValue'] = keyCondition.value;
    }

    return {
      conditions: this.conditions,
      indexName: this.indexName,
      limit: this.limit,
      select: this.selectedFields,
      keyCondition: {
        expression: keyConditionExpression,
        values: keyConditionValues,
      },
    };
  }
}
