import { createTodo, listTodos, deleteTodo, getTodoById } from '@/lib/todos-repo';
import * as db from '@/lib/db';

jest.mock('@/lib/db');

describe('todos-repo', () => {
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb = {
      prepare: jest.fn(),
      transaction: jest.fn(),
    };
    (db.getDb as jest.Mock).mockReturnValue(mockDb);
  });

  describe('createTodo', () => {
    it('should create a new todo with valid name', () => {
      const mockRun = jest.fn();
      mockDb.prepare.mockReturnValue({ run: mockRun });

      const result = createTodo('Test Task');

      expect(result).toEqual({
        id: expect.any(String),
        name: 'Test Task',
        createdAt: expect.any(String),
      });
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'INSERT INTO todos (id, name, created_at) VALUES (?, ?, ?)'
      );
      expect(mockRun).toHaveBeenCalledWith(result.id, 'Test Task', result.createdAt);
    });

    it('should throw error when name is empty', () => {
      expect(() => createTodo('')).toThrow('NAME_REQUIRED');
    });

    it('should throw error when name is only whitespace', () => {
      expect(() => createTodo('   ')).toThrow('NAME_REQUIRED');
    });

    it('should trim whitespace from name', () => {
      const mockRun = jest.fn();
      mockDb.prepare.mockReturnValue({ run: mockRun });

      createTodo('  Task with spaces  ');

      expect(mockRun).toHaveBeenCalledWith(
        expect.any(String),
        'Task with spaces',
        expect.any(String)
      );
    });
  });

  describe('listTodos', () => {
    it('should return list of todos', () => {
      const mockTodos = [
        { id: '1', name: 'Task 1', createdAt: '2026-06-11T00:00:00Z' },
        { id: '2', name: 'Task 2', createdAt: '2026-06-10T00:00:00Z' },
      ];
      const mockGet = jest.fn().mockReturnValue(true);
      const mockAll = jest.fn().mockReturnValue(mockTodos);
      
      mockDb.prepare.mockImplementation((query) => {
        if (query.includes('SELECT 1 FROM todos')) {
          return { get: mockGet };
        }
        if (query.includes('SELECT id, name')) {
          return { all: mockAll };
        }
        return { run: jest.fn() };
      });

      const result = listTodos();

      expect(result).toEqual(mockTodos);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT id, name, created_at as createdAt FROM todos ORDER BY created_at DESC'
      );
    });

    it('should ensure db is seeded before listing', () => {
      const mockGet = jest.fn().mockReturnValue(null);
      const mockAll = jest.fn().mockReturnValue([]);
      const mockRun = jest.fn();
      const mockTransaction = jest.fn((fn) => fn());
      
      mockDb.prepare.mockImplementation((query) => {
        if (query.includes('SELECT 1 FROM todos')) {
          return { get: mockGet };
        }
        if (query.includes('SELECT id, name')) {
          return { all: mockAll };
        }
        if (query.includes('INSERT INTO todos')) {
          return { run: mockRun };
        }
        return { get: mockGet, all: mockAll, run: mockRun };
      });
      mockDb.transaction.mockImplementation((fn) => () => fn());

      listTodos();

      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT 1 FROM todos LIMIT 1');
    });
  });

  describe('getTodoById', () => {
    it('should return todo by id', () => {
      const mockTodo = { id: '1', name: 'Task 1', createdAt: '2026-06-11T00:00:00Z' };
      
      mockDb.prepare.mockImplementation((query) => {
        if (query.includes('SELECT 1 FROM todos')) {
          return { get: () => true }; // DB is seeded
        }
        if (query.includes('WHERE id')) {
          return { get: () => mockTodo };
        }
        return { get: () => null, all: () => [] };
      });

      const result = getTodoById('1');

      expect(result).toEqual(mockTodo);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT id, name, created_at as createdAt FROM todos WHERE id = ?'
      );
    });

    it('should return null if todo not found', () => {
      mockDb.prepare.mockImplementation((query) => {
        if (query.includes('SELECT 1 FROM todos')) {
          return { get: () => true }; // DB is seeded
        }
        if (query.includes('WHERE id')) {
          return { get: () => undefined };
        }
        return { get: () => null, all: () => [] };
      });

      const result = getTodoById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('deleteTodo', () => {
    it('should delete todo and return true if found', () => {
      const mockRun = jest.fn().mockReturnValue({ changes: 1 });
      mockDb.prepare.mockReturnValue({ run: mockRun });

      const result = deleteTodo('1');

      expect(result).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith('DELETE FROM todos WHERE id = ?');
      expect(mockRun).toHaveBeenCalledWith('1');
    });

    it('should return false if todo not found', () => {
      const mockRun = jest.fn().mockReturnValue({ changes: 0 });
      mockDb.prepare.mockReturnValue({ run: mockRun });

      const result = deleteTodo('nonexistent');

      expect(result).toBe(false);
    });
  });
});
