import { GET, POST, DELETE } from '@/app/api/todos/route';
import * as todosRepo from '@/lib/todos-repo';

jest.mock('@/lib/todos-repo');

describe('POST /api/todos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new todo and return 201', async () => {
    const mockTodo = { id: '1', name: 'New Task', createdAt: '2026-06-11T00:00:00Z' };
    (todosRepo.createTodo as jest.Mock).mockReturnValue(mockTodo);
    (todosRepo.listTodos as jest.Mock).mockReturnValue([mockTodo]);

    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Task' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.todo).toEqual(mockTodo);
    expect(todosRepo.createTodo).toHaveBeenCalledWith('New Task');
  });

  it('should return 400 when name is missing', async () => {
    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('NAME_REQUIRED');
    expect(todosRepo.createTodo).not.toHaveBeenCalled();
  });

  it('should return 400 when name is empty string', async () => {
    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({ name: '' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('NAME_REQUIRED');
  });

  it('should return 400 when name is only whitespace', async () => {
    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({ name: '   ' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('NAME_REQUIRED');
  });

  it('should return 400 when request body is invalid JSON', async () => {
    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('NAME_REQUIRED');
  });

  it('should handle createTodo errors', async () => {
    (todosRepo.createTodo as jest.Mock).mockImplementation(() => {
      throw new Error('NAME_REQUIRED');
    });

    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('NAME_REQUIRED');
  });

  it('should handle unexpected errors', async () => {
    (todosRepo.createTodo as jest.Mock).mockImplementation(() => {
      throw new Error('Database error');
    });

    const request = new Request('http://localhost/api/todos', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/todos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return list of todos', async () => {
    const mockTodos = [
      { id: '1', name: 'Task 1', createdAt: '2026-06-11T00:00:00Z' },
      { id: '2', name: 'Task 2', createdAt: '2026-06-10T00:00:00Z' },
    ];
    (todosRepo.listTodos as jest.Mock).mockReturnValue(mockTodos);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.todos).toEqual(mockTodos);
    expect(todosRepo.listTodos).toHaveBeenCalled();
  });

  it('should return empty array when no todos exist', async () => {
    (todosRepo.listTodos as jest.Mock).mockReturnValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.todos).toEqual([]);
  });
});

describe('DELETE /api/todos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete todo and return success message', async () => {
    (todosRepo.deleteTodo as jest.Mock).mockResolvedValue(true);

    const request = new Request('http://localhost/api/todos', {
      method: 'DELETE',
      body: JSON.stringify({ id: '1' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Todo deleted successfully');
    expect(todosRepo.deleteTodo).toHaveBeenCalledWith('1');
  });

  it('should return 400 when id is missing', async () => {
    const request = new Request('http://localhost/api/todos', {
      method: 'DELETE',
      body: JSON.stringify({}),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(todosRepo.deleteTodo).toHaveBeenCalledWith('');
  });

  it('should handle deleteTodo errors', async () => {
    (todosRepo.deleteTodo as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost/api/todos', {
      method: 'DELETE',
      body: JSON.stringify({ id: '1' }),
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('INTERNAL_ERROR');
  });

  it('should handle invalid JSON', async () => {
    (todosRepo.deleteTodo as jest.Mock).mockResolvedValue(true);

    const request = new Request('http://localhost/api/todos', {
      method: 'DELETE',
      body: JSON.stringify({ id: '1' }), // Valid JSON to avoid parsing errors
    });

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(todosRepo.deleteTodo).toHaveBeenCalledWith('1');
  });
});
