import { QueryBuilder } from '../../operations/query-builder';
import { QueryOperationType } from '../../types';

describe('QueryBuilder', () => {
  describe('build method', () => {
    it('should return an object with the correct structure', () => {
      const builder = new QueryBuilder();
      builder.equals('userId', 'user123');
      const result = builder.build();

      expect(result).toHaveProperty('conditions');
      expect(result).toHaveProperty('keyCondition');
      expect(result.keyCondition).toHaveProperty('expression');
      expect(result.keyCondition).toHaveProperty('values');
    });

    it('should generate a proper keyCondition expression for equals', () => {
      const builder = new QueryBuilder();
      builder.equals('userId', 'user123');
      const result = builder.build();

      expect(result.keyCondition.expression).toBe('userId = :keyValue');
      expect(result.keyCondition.values[':keyValue']).toBe('user123');
    });

    it('should generate a proper keyCondition expression for begins_with', () => {
      const builder = new QueryBuilder();
      builder.beginsWith('userId', 'user');
      const result = builder.build();

      expect(result.keyCondition.expression).toBe('begins_with(userId, :keyValue)');
      expect(result.keyCondition.values[':keyValue']).toBe('user');
    });

    it('should generate a proper keyCondition expression for between', () => {
      const builder = new QueryBuilder();
      builder.between('age', 20, 30);
      const result = builder.build();

      expect(result.keyCondition.expression).toBe('age BETWEEN :start AND :end');
      expect(result.keyCondition.values[':start']).toBe(20);
      expect(result.keyCondition.values[':end']).toBe(30);
    });

    it('should include index name if specified', () => {
      const builder = new QueryBuilder();
      builder.usingIndex('EmailIndex');
      builder.equals('email', 'test@example.com');
      const result = builder.build();

      expect(result.indexName).toBe('EmailIndex');
    });

    it('should include limit if specified', () => {
      const builder = new QueryBuilder();
      builder.equals('userId', 'user123');
      builder.withLimit(10);
      const result = builder.build();

      expect(result.limit).toBe(10);
    });

    it('should include selected fields if specified', () => {
      const builder = new QueryBuilder();
      builder.equals('userId', 'user123');
      builder.selectFields(['name', 'email', 'age']);
      const result = builder.build();

      expect(result.select).toEqual(['name', 'email', 'age']);
    });

    it('should throw an error if no conditions are specified', () => {
      const builder = new QueryBuilder();
      expect(() => builder.build()).toThrow('No conditions specified');
    });
  });
});
