import { Controller, Get, Header } from '@nestjs/common';
import { AppService } from './app.service';
import type { ITodo } from './types/todo';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Header('Content-Type', 'application/json')
  getTodo(): ITodo {
    return this.appService.getTodo();
  }
}
