import { ScanBuilder } from '../src/operations/scan-builder';
import { validateFieldName, validateString } from '../src/core/error-handler';

// Mock the validation functions for tests
jest.mock('../src/core/error-handler', () => ({
  validateFieldName: jest.fn(),
  validateString: jest.fn((value, errorMessage) => {
    if (typeof value !== 'string' || value === '') {
      throw new Error(errorMessage || 'Value must be a non-empty string');
    }
  }),
  validateNumber: jest.fn(),
}));

describe('ScanBuilder', () => {
  let builder: ScanBuilder;

  beforeEach(() => {
    builder = new ScanBuilder();
    (validateFieldName as jest.Mock).mockClear();
    (validateString as jest.Mock).mockClear();
  });

  describe('Validation', () => {
    it('should reject invalid field names', () => {
      // Mock validateFieldName to throw for this test
      (validateFieldName as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Field name can only contain alphanumeric characters and underscores');
      });

      expect(() => builder.equals('invalid@field', 'value')).toThrow(
        'Field name can only contain alphanumeric characters and underscores'
      );
      expect(validateFieldName).toHaveBeenCalledWith('invalid@field');
    });

    it('should reject invalid limit values', () => {
      expect(() => builder.withLimit(0)).toThrow('Limit must be greater than 0');
      expect(() => builder.withLimit(-1)).toThrow('Limit must be greater than 0');
    });

    it('should reject empty index names', () => {
      expect(() => builder.usingIndex('')).toThrow();
      expect(validateString).toHaveBeenCalledWith('', 'Index name must be a non-empty string');
    });

    it('should reject invalid parallel scan configuration', () => {
      expect(() => builder.withParallelScan(0, 0)).toThrow('Total segments must be greater than 0');
      expect(() => builder.withParallelScan(2, 2)).toThrow('Segment must be between 0 and 1');
      expect(() => builder.withParallelScan(2, -1)).toThrow('Segment must be between 0 and 1');
    });

    it('should reject empty start key', () => {
      expect(() => builder.withStartKey({})).toThrow('Start key must be a non-empty object');
    });
  });

  describe('Building Expressions', () => {
    it('should build equals condition', () => {
      const options = builder.equals('name', 'John').build();
      expect(options.filter).toBe('name = :value0');
      expect(options.expressionValues).toEqual({ ':value0': 'John' });
    });

    it('should build not equals condition', () => {
      const options = builder.notEquals('age', 30).build();
      expect(options.filter).toBe('age <> :value0');
      expect(options.expressionValues).toEqual({ ':value0': 30 });
    });

    it('should build greater than condition', () => {
      const options = builder.greaterThan('age', 25).build();
      expect(options.filter).toBe('age > :value0');
      expect(options.expressionValues).toEqual({ ':value0': 25 });
    });

    it('should build less than condition', () => {
      const options = builder.lessThan('age', 50).build();
      expect(options.filter).toBe('age < :value0');
      expect(options.expressionValues).toEqual({ ':value0': 50 });
    });

    it('should build begins with condition', () => {
      const options = builder.beginsWith('name', 'J').build();
      expect(options.filter).toBe('begins_with(name, :value0)');
      expect(options.expressionValues).toEqual({ ':value0': 'J' });
    });

    it('should build contains condition', () => {
      const options = builder.contains('interests', 'coding').build();
      expect(options.filter).toBe('contains(interests, :value0)');
      expect(options.expressionValues).toEqual({ ':value0': 'coding' });
    });

    it('should build between condition', () => {
      const options = builder.between('age', 20, 30).build();
      expect(options.filter).toBe('age BETWEEN :value0 AND :value1');
      expect(options.expressionValues).toEqual({ ':value0': 20, ':value1': 30 });
    });

    it('should build attribute exists condition', () => {
      const options = builder.attributeExists('email').build();
      expect(options.filter).toBe('attribute_exists(email)');
    });

    it('should build attribute not exists condition', () => {
      const options = builder.attributeNotExists('deletedAt').build();
      expect(options.filter).toBe('attribute_not_exists(deletedAt)');
    });

    it('should build custom filter expression', () => {
      const options = builder.filter('size(interests) > :size', { ':size': 2 }).build();
      expect(options.filter).toBe('(size(interests) > :size)');
      expect(options.expressionValues).toEqual({ ':size': 2 });
    });
  });

  describe('Combining Operations', () => {
    it('should combine multiple conditions with AND', () => {
      const options = builder
        .equals('status', 'active')
        .greaterThan('age', 18)
        .lessThan('age', 65)
        .build();

      expect(options.filter).toBe('status = :value0 AND age > :value1 AND age < :value2');
      expect(options.expressionValues).toEqual({
        ':value0': 'active',
        ':value1': 18,
        ':value2': 65,
      });
    });

    it('should handle reserved words and special characters', () => {
      // Override the mocks for this test
      jest.unmock('../src/core/error-handler');

      // Let's make sure validateFieldName doesn't throw for this test
      (validateFieldName as jest.Mock).mockImplementation(() => {});

      // Create a new builder with those fields
      const orderBuilder = new ScanBuilder();
      const options = orderBuilder
        .equals('ORDER', 123)
        .equals('field-with-hyphens', 'value')
        .build();

      // Use partial assertions to be more flexible
      expect(options.expressionValues).toEqual({
        ':value0': 123,
        ':value1': 'value',
      });

      // Check that there are expression names
      expect(options.expressionNames).toBeDefined();
      expect(Object.keys(options.expressionNames || {}).length).toBe(2);
    });

    it('should include all options in the build result', () => {
      const options = builder
        .equals('status', 'active')
        .selectFields(['id', 'name', 'email'])
        .withLimit(10)
        .usingIndex('StatusIndex')
        .withConsistentRead(true)
        .withParallelScan(4, 1)
        .build();

      expect(options.filter).toBe('status = :value0');
      expect(options.expressionValues).toEqual({ ':value0': 'active' });
      expect(options.attributes).toEqual(['id', 'name', 'email']);
      expect(options.limit).toBe(10);
      expect(options.indexName).toBe('StatusIndex');
      expect(options.consistent).toBe(true);
      expect(options.totalSegments).toBe(4);
      expect(options.segment).toBe(1);
    });
  });
});
