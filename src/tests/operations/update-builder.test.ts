import { UpdateBuilder } from '../../operations/update-builder';
import { UpdateOperationType } from '../../types';

describe('UpdateBuilder', () => {
  describe('build method', () => {
    it('should return an array of FieldUpdate objects', () => {
      const builder = new UpdateBuilder();
      builder.set('name', 'John Doe');
      const result = builder.build();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toHaveProperty('field', 'name');
      expect(result[0]).toHaveProperty('value', 'John Doe');
      expect(result[0]).toHaveProperty('operation', UpdateOperationType.SET);
    });

    it('should throw an error if no updates are specified', () => {
      const builder = new UpdateBuilder();
      expect(() => builder.build()).toThrow('No updates specified');
    });
  });

  describe('appendToList method', () => {
    it('should create a SET operation with __listAppend flag', () => {
      const builder = new UpdateBuilder();
      builder.appendToList('interests', 'gaming');
      const result = builder.build();

      expect(result.length).toBe(1);
      expect(result[0].operation).toBe(UpdateOperationType.SET);
      expect(result[0].field).toBe('interests');
      expect(result[0].value).toHaveProperty('__listAppend', true);
      expect(result[0].value).toHaveProperty('items');
      expect(result[0].value.items).toEqual(['gaming']);
    });
  });

  describe('prependToList method', () => {
    it('should create a SET operation with __listPrepend flag', () => {
      const builder = new UpdateBuilder();
      builder.prependToList('interests', 'gaming');
      const result = builder.build();

      expect(result.length).toBe(1);
      expect(result[0].operation).toBe(UpdateOperationType.SET);
      expect(result[0].field).toBe('interests');
      expect(result[0].value).toHaveProperty('__listPrepend', true);
      expect(result[0].value).toHaveProperty('items');
      expect(result[0].value.items).toEqual(['gaming']);
    });
  });

  describe('increment method', () => {
    it('should create an ADD operation', () => {
      const builder = new UpdateBuilder();
      builder.increment('age', 1);
      const result = builder.build();

      expect(result.length).toBe(1);
      expect(result[0].operation).toBe(UpdateOperationType.ADD);
      expect(result[0].field).toBe('age');
      expect(result[0].value).toBe(1);
    });
  });

  describe('decrement method', () => {
    it('should create an ADD operation with negative value', () => {
      const builder = new UpdateBuilder();
      builder.decrement('age', 1);
      const result = builder.build();

      expect(result.length).toBe(1);
      expect(result[0].operation).toBe(UpdateOperationType.ADD);
      expect(result[0].field).toBe('age');
      expect(result[0].value).toBe(-1);
    });
  });

  describe('remove method', () => {
    it('should create a REMOVE operation', () => {
      const builder = new UpdateBuilder();
      builder.remove('temporaryField');
      const result = builder.build();

      expect(result.length).toBe(1);
      expect(result[0].operation).toBe(UpdateOperationType.REMOVE);
      expect(result[0].field).toBe('temporaryField');
      expect(result[0].value).toBeUndefined();
    });
  });

  describe('addToSet method', () => {
    it('should create an ADD operation', () => {
      const builder = new UpdateBuilder();
      builder.addToSet('roles', 'admin');
      const result = builder.build();

      expect(result.length).toBe(1);
      expect(result[0].operation).toBe(UpdateOperationType.ADD);
      expect(result[0].field).toBe('roles');
      expect(result[0].value).toBe('admin');
    });
  });

  describe('removeFromSet method', () => {
    it('should create a DELETE operation', () => {
      const builder = new UpdateBuilder();
      builder.removeFromSet('roles', 'guest');
      const result = builder.build();

      expect(result.length).toBe(1);
      expect(result[0].operation).toBe(UpdateOperationType.DELETE);
      expect(result[0].field).toBe('roles');
      expect(result[0].value).toBe('guest');
    });
  });

  describe('multiple operations', () => {
    it('should handle multiple different operations', () => {
      const builder = new UpdateBuilder();
      builder
        .set('name', 'John Doe')
        .increment('age', 1)
        .appendToList('interests', 'gaming')
        .removeFromSet('roles', 'guest');

      const result = builder.build();

      expect(result.length).toBe(4);
      expect(result.find(u => u.field === 'name')).toBeDefined();
      expect(result.find(u => u.field === 'age')).toBeDefined();
      expect(result.find(u => u.field === 'interests')).toBeDefined();
      expect(result.find(u => u.field === 'roles')).toBeDefined();
    });
  });
});
