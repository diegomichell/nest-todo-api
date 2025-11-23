import { Module } from '@nestjs/common';
import { TodosModule } from './todos.module';

@Module({
  imports: [
    TodosModule
  ],
})
export class AppModule {}
