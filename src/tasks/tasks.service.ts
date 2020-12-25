import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskStatus } from './task.enum';
import { TaskRepository } from './task.repository';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    // SCOPE 1: returns all tasks in the db when there are no filter parameters
    // SCOPE 2: returns the filtered tasks when there are filter parameters
    // ERROR HANDLING: none as the data was checked with 2 validation pipes in the controller
    // DETAILS: the logic for this service is all in the repository
    // RETURNS: since more than one task could be returned the output is a promise of an array of entity Task
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
      throw new NotFoundException(`ID --${id}-- not found`);
    }
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    // SCOPE: create a new task
    // ERROR HANDLING: none as the data was checked with a validation pipe in the controller
    // DETAILS: the logic for this service is all in the repository
    // RETURNS: a promise of an entity Task - the newly created task
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async deleteTask(id: number, user: User): Promise<void> {
    // SCOPE: deletes the task that matches the id and the userId
    // ERROR HANDLING: if no entities were deleted then the entity for the id did not exist and so we return an error
    // DETAILS 1: the task is deleted using the delete method
    // DETAILS 2: the delete method returns an affected param that specifies the number of entities deleted
    // RETURNS: nothing, hence returns a void promise
    const found = await this.taskRepository.delete({ id, userId: user.id });
    if (found.affected === 0) {
      throw new NotFoundException(`ID --${id}-- not found`);
    }
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
    await task.save();
    return task;
  }
}
