import { Body, Controller, Delete } from '@nestjs/common';
import { ParseIntPipe, Query } from '@nestjs/common';
import { Get, Param, Post, Patch, ValidationPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';
import { TaskFilterValidationPipe } from './pipes/task-filter-validation.pipe';
import { Task } from './task.entity';
import { TaskStatus } from './task.enum';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  // SCOPE: to retrieve all tasks or all task filtered by the params in the request query
  // ERROR HANDLING 1: First the keys of the query are validated using a custom validation pipe TaskFilterValidationPipe
  // ERROR HANDLING 2: Secondly the values in the query are validated using a validation pipe to the GetTasksFilterDto
  // DETAILS 1: The @Query decorator gets parameters in the query part of the url (after the ? and separated by &)
  // DETAILS 2: To validate the contents of the query, the validation pipes must be passed to the query,
  // DETAILS 3: not in the UsePipes() decorator
  // RETURNS: a promise of an array of entity Task - the retrieved tasks
  @Get()
  getTasks(
    @Query(TaskFilterValidationPipe, ValidationPipe)
    filterDto: GetTasksFilterDto,
  ): Promise<Task[]> {
    return this.tasksService.getTasks(filterDto);
  }

  // SCOPE: to retrieve a task by Id
  // ERROR HANDLING 1: The id is validated to be a number with the ParseIntPipe
  // ERROR HANDLING 2: Validation that the id actually exists in the db is done within the service
  // RETURNS: a promise of an entity Task - the retrieved task
  @Get('/:id')
  getTaskById(@Param('id', ParseIntPipe) id: number): Promise<Task> {
    return this.tasksService.getTaskById(id);
  }

  // SCOPE: to create a new task
  // ERROR HANDLING 1: the keys in the body are validated using a validation pipe to the CreateTaskDto
  // ERROR HANDLING 2: the keys must match otherwise an error is given since they do not have the @IsOptional decorator
  // ERROR HANDLING 3: the values in the body are validated using a validation pipe to the CreateTaskDto
  // RETURNS: a promise of an entity Task - the newly created task
  @Post()
  createTask(
    @Body(ValidationPipe) createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    return this.tasksService.createTask(createTaskDto);
  }

  // SCOPE: request to delete a task
  // ERROR HANDLING 1: The id is validated to be a number with the ParseIntPipe
  // ERROR HANDLING 2: Validation that the id actually exists in the db is done within the service
  // RETURNS: nothing, hence returns a void promise
  @Delete('/:id')
  deleteTask(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.tasksService.deleteTask(id);
  }

  // SCOPE: request to update the status of a task
  // ERROR HANDLING 1: The id is validated to be a number with the ParseIntPipe
  // ERROR HANDLING 2: The status in the body is validated using a custom validation pipe TaskStatusValidationPipe
  // RETURNS: a promise of an entity Task - the updated task
  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
  ): Promise<Task> {
    return this.tasksService.updateTaskStatus(id, status);
  }
}
