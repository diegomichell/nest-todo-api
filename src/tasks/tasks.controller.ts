import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req: RequestWithUser,
  ) {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.tasksService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: RequestWithUser,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    await this.tasksService.remove(id, req.user.id);
    return { message: 'Task deleted successfully' };
  }
}
