import { Body, Controller, Delete, Logger, UseGuards } from '@nestjs/common';
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

// NOTE 1a: Using AuthGuard - any request must included the access token that is
// NOTE 1b: received when a user signs in
// NOTE 2a: Strategy name was added such as to explicitly link
// NOTE 2b: the AuthGuard to the strategy we wrote
@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  private logger = new Logger('TaskController');
  constructor(private tasksService: TasksService) {}

  // SCOPE 1a: for the signed-in user, retrieve all tasks or all task filtered
  // SCOPE 1b: by the params in the request query
  // ERROR HANDLING 1a: First the keys of the query are validated using a
  // ERROR HANDLING 1a: custom validation pipe TaskFilterValidationPipe
  // ERROR HANDLING 2a: Secondly the values in the query are validated using a
  // ERROR HANDLING 2b: validation pipe to the GetTasksFilterDto
  // DETAILS 1a: The @Query decorator gets parameters in the query part of the
  // DETAILS 1b: url (after the ? and separated by &)
  // DETAILS 2a: To validate the contents of the query, the validation pipes
  // DETAILS 2b: must be passed to the query,
  // DETAILS 3: not in the UsePipes() decorator
  // DETAILS 4a: The user for the task is determined from the access token by
  // DETAILS 4b: the @GetUser custom decorator
  // RETURNS: a promise of an array of entity Task - the retrieved tasks
  @Get()
  getTasks(
    @Query(TaskFilterValidationPipe, ValidationPipe)
    filterDto: GetTasksFilterDto,
    @GetUser() user: User,
  ): Promise<Task[]> {
    this.logger.verbose(`User retrieving all tasks / filtered tasks.`);
    return this.tasksService.getTasks(filterDto, user);
  }

  // SCOPE: to retrieve a task by Id and userId
  // ERROR HANDLING 1: The id is validated to be a number with the ParseIntPipe
  // ERROR HANDLING 2a: Validation that the id actually exists in the db is done
  // ERROR HANDLING 2b: within the service
  // DETAILS 1a: The user for the task is determined from the access token
  // DETAILS 1b: by the@GetUser custom decorator
  // RETURNS: a promise of an entity Task - the retrieved task
  @Get('/:id')
  getTaskById(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(`User retrieving task by id`);
    return this.tasksService.getTaskById(id, user);
  }

  // SCOPE: to create a new task for the signed-in user
  // ERROR HANDLING 1a: the keys in the body are validated using a validation
  // ERROR HANDLING 1b: pipe to the CreateTaskDto
  // ERROR HANDLING 2a: the keys must match otherwise an error is given since
  // ERROR HANDLING 2b: they do not have the @IsOptional decorator
  // ERROR HANDLING 3a: the values in the body are validated using a validation
  // ERROR HANDLING 3b: pipe to the CreateTaskDto
  // DETAILS 1a: The user for the task is determined from the access token by
  // DETAILS 1b: the @GetUser custom decorator
  // RETURNS: a promise of an entity Task - the newly created task
  @Post()
  createTask(
    @Body(ValidationPipe) createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(`User creating a new task`);
    return this.tasksService.createTask(createTaskDto, user);
  }

  // SCOPE: request to delete a task for the signed-in user
  // ERROR HANDLING 1: The id is validated to be a number with the ParseIntPipe
  // ERROR HANDLING 2a: Validation that the id actually exists in the db is done
  // ERROR HANDLING 2b: within the service
  // DETAILS 1a: The user for the task is determined from the access token by
  // DETAILS 1b: the @GetUser custom decorator
  // RETURNS: nothing, hence returns a void promise
  @Delete('/:id')
  deleteTask(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    this.logger.verbose(`User deleting task by id.`);
    return this.tasksService.deleteTask(id, user);
  }

  // SCOPE: request to update the status of a task for the signed-in user
  // ERROR HANDLING 1: The id is validated to be a number with the ParseIntPipe
  // ERROR HANDLING 2a: The status in the body is validated using a custom
  // ERROR HANDLING 2b: validation pipe TaskStatusValidationPipe
  // DETAILS 1a: The user for the task is determined from the access token by
  // DETAILS 1b: the @GetUser custom decorator
  // RETURNS: a promise of an entity Task - the updated task
  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(`User updating task status`);
    return this.tasksService.updateTaskStatus(id, status, user);
  }
}
