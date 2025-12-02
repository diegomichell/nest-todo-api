import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from '../entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

describe('TasksService', () => {
  let service: TasksService;

  const mockTaskRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
      };
      const userId = 'user-1';
      const task = { id: '1', ...createTaskDto, userId };

      mockTaskRepository.create.mockReturnValue(task);
      mockTaskRepository.save.mockResolvedValue(task);

      const result = await service.create(createTaskDto, userId);

      expect(result).toEqual(task);
      expect(mockTaskRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        userId,
      });
      expect(mockTaskRepository.save).toHaveBeenCalledWith(task);
    });
  });

  describe('findAll', () => {
    it('should return all tasks for a user', async () => {
      const userId = 'user-1';
      const tasks = [
        {
          id: '1',
          title: 'Task 1',
          userId,
          status: TaskStatus.TODO,
        },
        {
          id: '2',
          title: 'Task 2',
          userId,
          status: TaskStatus.DONE,
        },
      ];

      mockTaskRepository.find.mockResolvedValue(tasks);

      const result = await service.findAll(userId);

      expect(result).toEqual(tasks);
      expect(mockTaskRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a task if it belongs to the user', async () => {
      const taskId = '1';
      const userId = 'user-1';
      const task = {
        id: taskId,
        title: 'Test Task',
        userId,
        status: TaskStatus.TODO,
      };

      mockTaskRepository.findOne.mockResolvedValue(task);

      const result = await service.findOne(taskId, userId);

      expect(result).toEqual(task);
      expect(mockTaskRepository.findOne).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if task does not belong to user', async () => {
      const task = {
        id: '1',
        title: 'Test Task',
        userId: 'user-2',
        status: TaskStatus.TODO,
      };

      mockTaskRepository.findOne.mockResolvedValue(task);

      await expect(service.findOne('1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should successfully update a task', async () => {
      const taskId = '1';
      const userId = 'user-1';
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.DONE,
      };
      const existingTask = {
        id: taskId,
        title: 'Test Task',
        userId,
        status: TaskStatus.TODO,
      };
      const updatedTask = { ...existingTask, ...updateTaskDto };

      mockTaskRepository.findOne.mockResolvedValue(existingTask);
      mockTaskRepository.save.mockResolvedValue(updatedTask);

      const result = await service.update(taskId, updateTaskDto, userId);

      expect(result).toEqual(updatedTask);
      expect(mockTaskRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should successfully remove a task', async () => {
      const taskId = '1';
      const userId = 'user-1';
      const task = {
        id: taskId,
        title: 'Test Task',
        userId,
        status: TaskStatus.TODO,
      };

      mockTaskRepository.findOne.mockResolvedValue(task);
      mockTaskRepository.remove.mockResolvedValue(task);

      await service.remove(taskId, userId);

      expect(mockTaskRepository.remove).toHaveBeenCalledWith(task);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockTaskRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
