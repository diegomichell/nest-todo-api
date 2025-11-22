import { Injectable } from '@nestjs/common';
import type { ITodo } from './types/todo';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getTodo(): ITodo {
    
    return {
      message: 'Take out the trash',
      completed: false
    }
  }
}
