/**
 * Validator for DynamoDB attributes
 */
import { TableAttributes, OperationResult, TableValidationResult, DomainAttributeDefinition } from './types';
/**
 * Validates table attributes and item data against defined schemas
 */
export declare class AttributeValidator {
    /**
     * Creates an error object
     */
    private createError;
    /**
     * Gets default error message for error type
     */
    private getDefaultErrorMessage;
    /**
     * Validates table attributes definition and converts to DynamoDB format
     */
    validateTableAttributes(table: TableAttributes | {
        tableName: string;
        attributes: Record<string, DomainAttributeDefinition>;
    }): OperationResult<TableValidationResult>;
    /**
     * Validates a single attribute definition
     */
    private validateAttributeDefinition;
    /**
     * Validates attribute name format
     */
    private isValidAttributeName;
    /**
     * Validates domain type
     */
    private isValidDomainType;
}
