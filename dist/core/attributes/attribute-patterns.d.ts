/**
 * Common patterns for DynamoDB attribute validation
 */
export declare const AttributePatterns: {
    readonly USER_ID: "^USR_[0-9]{1,10}$";
    readonly USERNAME: "^[a-zA-Z0-9_-]{3,16}$";
    readonly EMAIL: "^[^@]+@[^@]+\\.[^@]+$";
    readonly PASSWORD: "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$";
    readonly PHONE: "^\\+?[1-9]\\d{1,14}$";
    readonly ISO_DATE: "^\\d{4}-\\d{2}-\\d{2}$";
    readonly ISO_DATETIME: "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?Z$";
    readonly TIME_24H: "^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$";
    readonly URL: "^https?://[\\w\\d\\-._~:/?#[\\]@!$&'()*+,;=]+$";
    readonly IPV4: "^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$";
    readonly DOMAIN: "^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,}$";
    readonly UUID: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$";
    readonly PRODUCT_ID: "^PRD_[0-9A-Z]{8}$";
    readonly ORDER_ID: "^ORD_[0-9A-Z]{10}$";
    readonly SKU: "^[A-Z]{2,4}-[0-9]{4,8}$";
    readonly TWITTER_HANDLE: "^@[A-Za-z0-9_]{1,15}$";
    readonly HASHTAG: "^#[A-Za-z0-9_]+$";
    readonly LATITUDE: "^-?([1-8]?[0-9](\\.\\d+)?|90(\\.0+)?)$";
    readonly LONGITUDE: "^-?((1[0-7]|[1-9])?\\d(\\.\\d+)?|180(\\.0+)?)$";
    readonly ZIP_CODE: "^[0-9]{5}(-[0-9]{4})?$";
    readonly CURRENCY_CODE: "^[A-Z]{3}$";
    readonly CREDIT_CARD: "^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$";
    readonly PRICE: "^\\d+\\.\\d{2}$";
    readonly SLUG: "^[a-z0-9]+(?:-[a-z0-9]+)*$";
    readonly HEX_COLOR: "^#[0-9A-Fa-f]{6}$";
    readonly SEMVER: "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$";
};
/**
 * Helper function to test a pattern
 */
export declare const PatternUtils: {
    /**
     * Tests if a value matches a pattern
     * @param value The value to test
     * @param pattern The pattern to test against
     * @returns boolean indicating if the value matches the pattern
     *
     * @example
     * PatternUtils.test('user@example.com', AttributePatterns.EMAIL) // returns true
     * PatternUtils.test('invalid-email', AttributePatterns.EMAIL) // returns false
     */
    test: (value: string, pattern: string) => boolean;
    /**
     * Gets an example value for a pattern
     * @param pattern The pattern key from AttributePatterns
     * @returns An example value that matches the pattern
     */
    getExample: (pattern: keyof typeof AttributePatterns) => string;
};
