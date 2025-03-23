/**
 * Common patterns for DynamoDB attribute validation
 */

export const AttributePatterns = {
  // User related patterns
  USER_ID: '^USR_[0-9]{1,10}$', // Example: USR_123456
  USERNAME: '^[a-zA-Z0-9_-]{3,16}$', // Example: john_doe123
  EMAIL: '^[^@]+@[^@]+\\.[^@]+$', // Example: user@example.com
  PASSWORD: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$', // Min 8 chars, 1 letter, 1 number
  PHONE: '^\\+?[1-9]\\d{1,14}$', // Example: +1234567890 (E.164 format)

  // Date and time patterns
  ISO_DATE: '^\\d{4}-\\d{2}-\\d{2}$', // Example: 2024-02-25
  ISO_DATETIME: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(\\.\\d{1,3})?Z$', // Example: 2024-02-25T14:30:00Z
  TIME_24H: '^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$', // Example: 14:30:00

  // Web related patterns
  URL: "^https?://[\\w\\d\\-._~:/?#[\\]@!$&'()*+,;=]+$", // Example: https://example.com
  IPV4: '^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', // Example: 192.168.1.1
  DOMAIN: '^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,}$', // Example: example.com

  // Identity and codes
  UUID: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$', // Example: 123e4567-e89b-12d3-a456-426614174000
  PRODUCT_ID: '^PRD_[0-9A-Z]{8}$', // Example: PRD_12AB34CD
  ORDER_ID: '^ORD_[0-9A-Z]{10}$', // Example: ORD_12AB34CD56
  SKU: '^[A-Z]{2,4}-[0-9]{4,8}$', // Example: SKU-12345

  // Social media
  TWITTER_HANDLE: '^@[A-Za-z0-9_]{1,15}$', // Example: @username
  HASHTAG: '^#[A-Za-z0-9_]+$', // Example: #hashtag

  // Geographic
  LATITUDE: '^-?([1-8]?[0-9](\\.\\d+)?|90(\\.0+)?)$', // Example: 41.40338
  LONGITUDE: '^-?((1[0-7]|[1-9])?\\d(\\.\\d+)?|180(\\.0+)?)$', // Example: 2.17403
  ZIP_CODE: '^[0-9]{5}(-[0-9]{4})?$', // Example: 12345 or 12345-6789

  // Financial
  CURRENCY_CODE: '^[A-Z]{3}$', // Example: USD, EUR
  CREDIT_CARD: '^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$', // Example: 1234-5678-9012-3456
  PRICE: '^\\d+\\.\\d{2}$', // Example: 99.99

  // Custom formats
  SLUG: '^[a-z0-9]+(?:-[a-z0-9]+)*$', // Example: my-page-slug
  HEX_COLOR: '^#[0-9A-Fa-f]{6}$', // Example: #FF0000
  SEMVER:
    '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$', // Example: 1.0.0
} as const;

/**
 * Helper function to test a pattern
 */
export const PatternUtils = {
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
  test: (value: string, pattern: string): boolean => {
    const regex = new RegExp(pattern);
    return regex.test(value);
  },

  /**
   * Gets an example value for a pattern
   * @param pattern The pattern key from AttributePatterns
   * @returns An example value that matches the pattern
   */
  getExample: (pattern: keyof typeof AttributePatterns): string => {
    const examples: Record<keyof typeof AttributePatterns, string> = {
      USER_ID: 'USR_123456',
      USERNAME: 'john_doe123',
      EMAIL: 'user@example.com',
      PASSWORD: 'Password123!',
      PHONE: '+1234567890',
      ISO_DATE: '2024-02-25',
      ISO_DATETIME: '2024-02-25T14:30:00Z',
      TIME_24H: '14:30:00',
      URL: 'https://example.com',
      IPV4: '192.168.1.1',
      DOMAIN: 'example.com',
      UUID: '123e4567-e89b-12d3-a456-426614174000',
      PRODUCT_ID: 'PRD_12AB34CD',
      ORDER_ID: 'ORD_12AB34CD56',
      SKU: 'SKU-12345',
      TWITTER_HANDLE: '@username',
      HASHTAG: '#hashtag',
      LATITUDE: '41.40338',
      LONGITUDE: '2.17403',
      ZIP_CODE: '12345-6789',
      CURRENCY_CODE: 'USD',
      CREDIT_CARD: '1234-5678-9012-3456',
      PRICE: '99.99',
      SLUG: 'my-page-slug',
      HEX_COLOR: '#FF0000',
      SEMVER: '1.0.0',
    };
    return examples[pattern];
  },
};
