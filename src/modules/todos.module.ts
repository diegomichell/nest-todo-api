import { Module } from '@nestjs/common';
import { TodosController } from '../controllers/todos.controller';
import { TodosService } from '../services/todos.service';
import { DatabaseModule } from './database.module';

@Module({
  imports: [
    DatabaseModule
  ],
  controllers: [TodosController],
  providers: [TodosService],
})
export class TodosModule {}
