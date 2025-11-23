import { Test, TestingModule } from '@nestjs/testing';
import { TodosController } from './todos.controller';
import { TodosService } from '../services/todos.service';

class MockAppService {
  getTodos = jest.fn().mockResolvedValue([
    {
      message: 'Sample Todo',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  createTodo = jest.fn();
}

describe('TodosController', () => {
  let appController: TodosController;
  let appService: TodosService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TodosController],
      providers: [
        {
          provide: TodosService,
          useClass: MockAppService,
        },
      ],
    }).compile();

    appController = app.get<TodosController>(TodosController);
    appService = app.get<TodosService>(TodosService);
  });

  describe('todos', () => {
    it('should return uncompleted todo', async () => {
      const todos = await appController.getTodos();

      expect(todos[0].completed).toBe(false);
    });

    it('should call service create todo', async () => {
      await appController.createTodo({
        message: 'A todo',
        completed: true,
      });

      expect(appService.createTodo).toHaveBeenCalled();
    });
  });
});
