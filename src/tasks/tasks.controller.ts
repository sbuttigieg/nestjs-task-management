import { Body, Controller, Delete } from '@nestjs/common';
import { ParseIntPipe, Query, UsePipes } from '@nestjs/common';
import { Get, Param, Post, Patch, ValidationPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';
import { TaskFilterValidationPipe } from './pipes/task-filter-validation.pipe';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';

@Controller('tasks')
export class TasksController {
  // NOTE: Dependency injection for TasksService is done within the constructor
  constructor(private tasksService: TasksService) {}

  // Request to retrieve all tasks or all task filtered by the params in the request query
  // The parameters in the query are validated using 2 validation pipes
  // first validation pipe checks with GetTasksFilterDto
  // second validation pipe checks that actual filter params (not values) in the query are as per TaskFilters enum
  // The @Query decorator gets parameters in the query part of the url (after the ? and separated by &)
  // To validate the contents of the query, the validation pipes must be passed to the query,
  // not in the UsePipes() decorator
  @Get()
  getTasks(
    @Query(ValidationPipe, TaskFilterValidationPipe)
    filterDto: GetTasksFilterDto,
  ): Promise<Task[]> {
    return this.tasksService.getTasks(filterDto);
  }

  // Request to retrieve a task by Id
  // The id is validated to be a number with the ParseIntPipe
  // Validation that the id actually exists in the db is done within the service
  @Get('/:id')
  getTaskById(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    return this.tasksService.getTaskById(id);
  }

  // Request to create a new task
  // The parameters in the body are validated using a validation pipe to the CreateTaskDto
  // TIP: One can optionally use createTask(@Body() body) to read the whole message body
  // TIP: One can optionally use specific parameters from the body
  // createTask(
  //     @Body('title') title: string,
  //     @Body('description') description: string,
  // )
  @Post()
  @UsePipes(ValidationPipe)
  createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.createTask(createTaskDto);
  }

  // Request to delete a task
  // The id is validated to be a number with the ParseIntPipe
  // Validation that the id actually exists in the db is done within the service
  @Delete('/:id')
  deleteTask(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tasksService.deleteTask(id);
  }

  // Request to update the status of a task
  // The status in the body is validated using a custom validation pipe
  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
  ): Promise<Task> {
    return this.tasksService.updateTaskStatus(id, status);
  }
}
