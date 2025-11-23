import { Injectable } from '@nestjs/common';
import type { ICreateTodo } from '../types/todo';
import { Todo } from '../entity/Todo';

@Injectable()
export class TodosService {
  async createTodo(newTodo: ICreateTodo) {
    const todo = new Todo();
    todo.message = newTodo.message;
    todo.completed = newTodo.completed;

    return await todo.save();
  }

  getTodos() {
    return Todo.find();
  }

  getTodo(id: number) {
    return Todo.findOneBy({ id });
  }
}
