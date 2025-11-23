import { Body, Controller, Get, Header, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { TodosService } from '../services/todos.service';
import type { Response } from 'express';
import type { ICreateTodo, ITodoItem } from '../types/todo';

@Controller('/todos')
export class TodosController {
  constructor(private readonly appService: TodosService) {}

  @Post()
  @Header('Content-Type', 'application/json')
  async createTodo(@Body() todo: ICreateTodo): Promise<ITodoItem> {
    return this.appService.createTodo(todo);
  }

  @Get()
  @Header('Content-Type', 'application/json')
  async getTodos(): Promise<ITodoItem[]> {
    const todoRecords = await this.appService.getTodos();
    return todoRecords.map(todo => ({
      id: todo.id,
      message: todo.message,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt
    }));
  }

  @Get(':id')
  @Header('Content-Type', 'application/json')
  async getTodo(@Param('id') id: number, @Res() res: Response): Promise<ITodoItem | null> {
    console.log('id', id);
    const todo = await this.appService.getTodo(id);
    if (!todo) {
      res.status(HttpStatus.NOT_FOUND).send();
      return null;
    }

    const todoRes = {
      id: todo.id,
      message: todo.message,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };

    res.send(todoRes);
    return todoRes;
  }
}
