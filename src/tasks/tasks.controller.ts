import { Body, Controller, Delete, UseGuards } from '@nestjs/common';
import { Get, Param, Post, Patch, Query } from '@nestjs/common';
import { ParseIntPipe, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { TaskStatus } from './task.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';
import { TaskFilterValidationPipe } from './pipes/task-filter-validation.pipe';
import { User } from '../auth/user.entity';
import { GetUser } from '../auth/get-user.decorator';

// Using AuthGuard - any request must included the access token that is received when a user signs in
@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  constructor(private tasksService: TasksService) {}

  // SCOPE: for the signed-in user, retrieve all tasks or all task filtered by the params in the request query
  // ERROR HANDLING 1: First the keys of the query are validated using a custom validation pipe TaskFilterValidationPipe
  // ERROR HANDLING 2: Secondly the values in the query are validated using a validation pipe to the GetTasksFilterDto
  // DETAILS 1: The @Query decorator gets parameters in the query part of the url (after the ? and separated by &)
  // DETAILS 2: To validate the contents of the query, the validation pipes must be passed to the query,
  // DETAILS 3: not in the UsePipes() decorator
  // DETAILS 4: The user for the task is determined from the access token by the @GetUser custom decorator
  // RETURNS: a promise of an array of entity Task - the retrieved tasks
  @Get()
  getTasks(
    @Query(TaskFilterValidationPipe, ValidationPipe)
    filterDto: GetTasksFilterDto,
    @GetUser() user: User,
  ): Promise<Task[]> {
    return this.tasksService.getTasks(filterDto, user);
  }

  // SCOPE: to retrieve a task by Id and userId
  // ERROR HANDLING 1: The id is validated to be a number with the ParseIntPipe
  // ERROR HANDLING 2: Validation that the id actually exists in the db is done within the service
  // DETAILS: The user for the task is determined from the access token by the @GetUser custom decorator
  // RETURNS: a promise of an entity Task - the retrieved task
  @Get('/:id')
  getTaskById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tasksService.getTaskById(id, user);
  }

  // SCOPE: to create a new task for the signed-in user
  // ERROR HANDLING 1: the keys in the body are validated using a validation pipe to the CreateTaskDto
  // ERROR HANDLING 2: the keys must match otherwise an error is given since they do not have the @IsOptional decorator
  // ERROR HANDLING 3: the values in the body are validated using a validation pipe to the CreateTaskDto
  // DETAILS: The user for the task is determined from the access token by the @GetUser custom decorator
  // RETURNS: a promise of an entity Task - the newly created task
  @Post()
  createTask(
    @Body(ValidationPipe) createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tasksService.createTask(createTaskDto, user);
  }

  // SCOPE: request to delete a task for the signed-in user
  // ERROR HANDLING 1: The id is validated to be a number with the ParseIntPipe
  // ERROR HANDLING 2: Validation that the id actually exists in the db is done within the service
  // DETAILS: The user for the task is determined from the access token by the @GetUser custom decorator
  // RETURNS: nothing, hence returns a void promise
  @Delete('/:id')
  deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.tasksService.deleteTask(id, user);
  }

  // SCOPE: request to update the status of a task for the signed-in user
  // ERROR HANDLING 1: The id is validated to be a number with the ParseIntPipe
  // ERROR HANDLING 2: The status in the body is validated using a custom validation pipe TaskStatusValidationPipe
  // DETAILS: The user for the task is determined from the access token by the @GetUser custom decorator
  // RETURNS: a promise of an entity Task - the updated task
  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
    @GetUser() user: User,
  ): Promise<Task> {
    return this.tasksService.updateTaskStatus(id, status, user);
  }
}
