/**
 * List of DynamoDB reserved words that need to be escaped
 * Source: AWS DynamoDB Documentation
 */
export declare const DYNAMODB_RESERVED_WORDS: Set<string>;
/**
 * Utility class for working with DynamoDB reserved words
 */
export declare class ReservedWords {
    /**
     * Check if a word is a reserved word in DynamoDB
     * @param word - The word to check
     * @returns true if the word is reserved
     */
    static isReserved(word: string): boolean;
    /**
     * Get a list of all reserved words
     * @returns Array of all reserved words (lowercase)
     */
    static getAll(): string[];
    /**
     * Get an expression attribute name for a potentially reserved word
     * @param attributeName - The attribute name to check
     * @returns The attribute name with # prefix if reserved
     */
    static getExpressionName(attributeName: string): string;
}
/**
 * Utility class to handle DynamoDB reserved words and expression attribute names
 */
export declare class ExpressionAttributeHandler {
    private expressionAttributeNames;
    private attributeNameMap;
    private nameCount;
    /**
     * Check if an attribute name is a reserved word
     */
    private isReservedWord;
    /**
     * Get the expression attribute name for a given attribute
     * If it's a reserved word or contains special characters, returns the mapped name
     * Otherwise returns the original name
     */
    getExpressionAttributeName(attributeName: string): string;
    /**
     * Get all expression attribute names used
     */
    getExpressionAttributeNames(): Record<string, string> | undefined;
    /**
     * Process projection expression to handle reserved words
     */
    processProjectionExpression(attributes: string[]): {
        projectionExpression: string;
        expressionAttributeNames: Record<string, string> | undefined;
    };
    /**
     * Process key condition expression to handle reserved words
     */
    processKeyConditionExpression(expression: string): {
        keyConditionExpression: string;
        expressionAttributeNames: Record<string, string> | undefined;
    };
    /**
     * Reset the handler state
     */
    reset(): void;
}
