import { InternalServerErrorException, Logger } from '@nestjs/common';
import { Task } from './task.entity';
import { TaskStatus } from './task.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  private logger = new Logger('TaskRepository');
  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    // SCOPE 1: returns all tasks in the db when there are no filter parameters
    // SCOPE 2: returns the filtered tasks when there are filter parameters
    // ERROR HANDLING 1: Data checked with 2 validation pipes in the controller
    // ERROR HANDLING 2: If query fails, internal server error is thrown
    // DETAILS 1: query builder is used to filter
    // DETAILS 2: the query starts by filtering by userId
    // DETAILS 3a: when status and/or search params are passed, these are added
    // DETAILS 3b: to the query.
    // DETAILS 4: andWhere is used when to add more filtering to a query
    // DETAILS 5a: the query.getMany method is used to get all the resulting
    // DETAILS 5b: tasks in the query
    // RETURNS 1a: since more than one task could be returned the output is a
    // RETURNS 1b: promise of an array of entity Task
    const { status, search } = filterDto;
    const query = this.createQueryBuilder('task');
    query.where('task.userId = :userId', { userId: user.id });
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    if (search) {
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` },
      );
    }
    try {
      const tasks: Task[] = await query.getMany();
      this.logger.debug(
        `Task query successful for "${user.username}", ` +
          `Filters: ${JSON.stringify(filterDto)}`,
      );
      return tasks;
    } catch (error) {
      this.logger.debug(
        `Failed to get tasks for user "${user.username}", ` +
          `Info: ${JSON.stringify(filterDto)}, Error #2000`,
      );
      this.logger.error(`Failed to get tasks, Error #2000`, error.stack);
      throw new InternalServerErrorException('Error #2000');
    }
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    // SCOPE: create a new task
    // ERROR HANDLING 1: data checked with a validation pipe in the controller
    // ERROR HANDLING 2: If saving fails, internal server error is thrown
    // DETAILS 1: the id is automatically generated
    // DETAILS 2: the save method stores the data in the db
    // DETAILS 3a: delete the user part of the task before returning it such a
    // DETAILS 3b: not to show the user details
    // RETURNS: a promise of an entity Task - the newly created task
    const task = new Task();
    const { title, description } = createTaskDto;
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.user = user;
    try {
      await task.save();
      delete task.user;
      this.logger.debug(
        `Task created successfully for "${user.username}", ` +
          `Task: ${JSON.stringify(createTaskDto)}`,
      );
      return task;
    } catch (error) {
      this.logger.debug(
        `Failed to create task for user "${user.username}", ` +
          `Task: ${JSON.stringify(createTaskDto)}, Error #2010`,
      );
      this.logger.error(`Failed to create task, Error #2010`, error.stack);
      throw new InternalServerErrorException('Error #2010');
    }
  }
}
