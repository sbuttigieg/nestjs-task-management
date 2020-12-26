import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskStatus } from './task.enum';
import { TaskRepository } from './task.repository';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
  private logger = new Logger('TasksService');
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    // SCOPE 1: returns all tasks in the db when there are no filter parameters
    // SCOPE 2: returns the filtered tasks when there are filter parameters
    // ERROR HANDLING: none, data checked with 2 validation pipes in controller
    // DETAILS: the logic for this service is all in the repository
    // RETURNS 1a: since more than one task could be returned the output is a
    // RETURNS 1b: promise of an array of entity Task
    return this.taskRepository.getTasks(filterDto, user);
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    // SCOPE: returns the task that matches the id and the userId
    // ERROR HANDLING: if the task does not exist a new exception is thrown
    // DETAILS: uses the findOne method to match the task id and userId
    // RETURNS: a promise of an entity Task - the retrieved task
    const found = await this.taskRepository.findOne({
      where: { id, userId: user.id },
    });
    if (!found) {
      this.logger.debug(
        `Failed to find task ${id} for user "${user.username}", Error #2050`,
      );
      this.logger.error(`Failed to find task, Error #2050`);
      throw new NotFoundException(`ID not found, Error #2050`);
    }
    this.logger.debug(
      `Task ${id} retrieved successfully for "${user.username}",
         Task: ${JSON.stringify(found)}`,
    );
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    // SCOPE: create a new task
    // ERROR HANDLING: none, data checked with a validation pipe in controller
    // DETAILS: the logic for this service is all in the repository
    // RETURNS: a promise of an entity Task - the newly created task
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async deleteTask(id: number, user: User): Promise<void> {
    // SCOPE: deletes the task that matches the id and the userId
    // ERROR HANDLING 1a: if no entities were deleted then the entity for the ID
    // ERROR HANDLING 1b: did not exist and so we return an error
    // DETAILS 1: the task is deleted using the delete method
    // DETAILS 2a: the delete method returns an affected param that specifies
    // DETAILS 2b: the number of entities deleted
    // RETURNS: nothing, hence returns a void promise
    const found = await this.taskRepository.delete({ id, userId: user.id });
    if (found.affected === 0) {
      this.logger.debug(
        `Failed to delete task ${id} for user "${user.username}", ` +
          'ID not found, Error #2060',
      );
      this.logger.error(`Failed to delete task, ID not found, Error #2060`);
      throw new NotFoundException(`ID not found, Error #2060`);
    }
    this.logger.debug(`Task ${id} deleted successfully for "${user.username}"`);
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    // SCOPE: updates the status parameter of a task defined by the id and userId
    // ERROR HANDLING 1: the task id is validated within the getTaskById method
    // ERROR HANDLING 2: the status is validated with a custom validation pipe in the controller
    // DETAILS: the save method stores the data in the db
    // RETURNS: a promise of an entity Task - the updated task
    const task = await this.getTaskById(id, user);
    task.status = status;
    try {
      await task.save();
      this.logger.debug(`Task ${id} updated successfully for "${user.username}",
      Task Status: ${status}`);
      return task;
    } catch (error) {
      this.logger.debug(
        `Error while updating task ${id} for user "${user.username}", ` +
          `Task Status ${status}, Error #2070`,
      );
      this.logger.error(`Error while updating task, Error #2070`);
      throw new InternalServerErrorException('Error #2070');
    }
  }
}
