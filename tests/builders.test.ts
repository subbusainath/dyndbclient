import { ClientBuilder } from '../src/core/client-builder';
import { UpdateBuilder } from '../src/operations/update-builder';
import { QueryBuilder } from '../src/operations/query-builder';

describe('Builder Security Tests', () => {
  describe('ClientBuilder', () => {
    it('should reject empty region', () => {
      expect(() => new ClientBuilder().withRegion('')).toThrow('Region must be a non-empty string');
    });

    it('should reject invalid table name', () => {
      expect(() => new ClientBuilder().withTableName('invalid@name')).toThrow(
        'Table name can only contain alphanumeric characters, hyphens, and underscores'
      );
    });

    it('should reject invalid endpoint URL', () => {
      expect(() => new ClientBuilder().withEndpoint('not-a-url')).toThrow(
        'Invalid endpoint URL format'
      );
    });

    it('should reject empty credentials', () => {
      expect(() =>
        new ClientBuilder()
          .withRegion('us-east-1')
          .withTableName('test-table')
          .withEndpoint('https://dynamodb.amazonaws.com')
          .withClientOptions({
            credentials: {
              accessKeyId: '',
              secretAccessKey: '',
            },
          })
          .build()
      ).toThrow(
        'If explicit credentials are provided for non-local endpoints, they cannot be empty'
      );
    });

    it('should accept non-local endpoints without explicit credentials', () => {
      // This should NOT throw because the AWS SDK will use the default credential provider chain
      expect(() =>
        new ClientBuilder()
          .withRegion('us-east-1')
          .withTableName('test-table')
          .withEndpoint('https://dynamodb.amazonaws.com')
          .withClientOptions({})
          .build()
      ).not.toThrow();
    });
  });

  describe('UpdateBuilder', () => {
    it('should reject empty field names', () => {
      expect(() => new UpdateBuilder().set('', 'value')).toThrow(
        'Field name must be a non-empty string'
      );
    });

    it('should reject invalid field names', () => {
      expect(() => new UpdateBuilder().set('invalid@field', 'value')).toThrow(
        'Field name can only contain alphanumeric characters and underscores'
      );
    });

    it('should reject undefined values', () => {
      expect(() => new UpdateBuilder().set('field', undefined)).toThrow(
        'Value cannot be undefined or null'
      );
    });

    it('should reject large string values', () => {
      const largeString = 'a'.repeat(400001);
      expect(() => new UpdateBuilder().set('field', largeString)).toThrow(
        'String value exceeds maximum length of 400KB'
      );
    });

    it('should reject invalid numeric values', () => {
      expect(() => new UpdateBuilder().increment('field', NaN)).toThrow(
        'Value must be a valid number'
      );
    });

    it('should enforce maximum updates limit', () => {
      const builder = new UpdateBuilder();
      // Create 99 updates
      for (let i = 0; i < 99; i++) {
        builder.set(`field${i}`, `value${i}`);
      }
      // The 100th update should succeed
      builder.set('field99', 'value99');
      // The 101st update should fail
      expect(() => builder.set('field100', 'value100')).toThrow(
        'Maximum number of updates (100) exceeded'
      );
    });
  });

  describe('QueryBuilder', () => {
    it('should reject empty field names', () => {
      expect(() => new QueryBuilder().equals('', 'value')).toThrow(
        'Field name must be a non-empty string'
      );
    });

    it('should reject invalid field names', () => {
      expect(() => new QueryBuilder().equals('invalid@field', 'value')).toThrow(
        'Field name can only contain alphanumeric characters and underscores'
      );
    });

    it('should reject invalid index names', () => {
      expect(() => new QueryBuilder().usingIndex('invalid@index')).toThrow(
        'Index name can only contain alphanumeric characters and underscores'
      );
    });

    it('should reject invalid limit values', () => {
      expect(() => new QueryBuilder().withLimit(0)).toThrow(
        'Limit must be a number between 1 and 1000'
      );
      expect(() => new QueryBuilder().withLimit(1001)).toThrow(
        'Limit must be a number between 1 and 1000'
      );
    });

    it('should reject empty field arrays', () => {
      expect(() => new QueryBuilder().selectFields([])).toThrow('Fields must be a non-empty array');
    });

    it('should reject invalid numeric values in comparisons', () => {
      expect(() => new QueryBuilder().greaterThan('field', NaN)).toThrow(
        'Value must be a valid number'
      );
    });

    it('should reject invalid between range', () => {
      expect(() => new QueryBuilder().between('field', 10, 5)).toThrow(
        'Start value must be less than or equal to end value'
      );
    });

    it('should reject empty arrays in in condition', () => {
      expect(() => new QueryBuilder().in('field', [])).toThrow('Values must be a non-empty array');
    });

    it('should enforce maximum conditions limit', () => {
      const builder = new QueryBuilder();
      // Create 99 conditions
      for (let i = 0; i < 99; i++) {
        builder.equals(`field${i}`, `value${i}`);
      }
      // The 100th condition should succeed
      builder.equals('field99', 'value99');
      // The 101st condition should fail
      expect(() => builder.equals('field100', 'value100')).toThrow(
        'Maximum number of conditions (100) exceeded'
      );
    });
  });
});
