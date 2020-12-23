import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    // SCOPE 1: returns all tasks in the db when there are no filter parameters
    // SCOPE 2: returns the filtered tasks when there are filter parameters
    // ERROR HANDLING: none as the data was checked with 2 validation pipes in the controller
    // DETAILS: the logic for this service is all in the repository
    // RETURNS: since more than one task could be returned the output is a promise of an array of entity Task
    return this.taskRepository.getTasks(filterDto);
  }

  async getTaskById(id: number): Promise<Task> {
    // SCOPE: returns the task that matches the id
    // ERROR HANDLING: if the task does not exist a new exception is thrown
    // DETAILS: uses the findOne method to match the task id
    // RETURNS: a promise of an entity Task - the retrieved task
    const found = await this.taskRepository.findOne(id);
    if (!found) {
      throw new NotFoundException(`ID --${id}-- not found`);
    }
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    // SCOPE: create a new task
    // ERROR HANDLING: none as the data was checked with a validation pipe in the controller
    // DETAILS: the logic for this service is all in the repository
    // RETURNS: a promise of an entity Task - the newly created task
    return this.taskRepository.createTask(createTaskDto);
  }

  async deleteTask(id: number): Promise<void> {
    // SCOPE: deletes the task that matches the id
    // ERROR HANDLING: if no entities were deleted then the entity for the id did not exist and so we return an error
    // DETAILS 1: the task is deleted using the delete method
    // DETAILS 2: the delete method returns an affected param that specifies the number of entities deleted
    // RETURNS: nothing, hence returns a void promise
    const found = await this.taskRepository.delete(id);
    if (found.affected === 0) {
      throw new NotFoundException(`ID --${id}-- not found`);
    }
  }

  async updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    // SCOPE: updates the status parameter of a task defined by the id
    // ERROR HANDLING 1: the task id is validated within the getTaskById method
    // ERROR HANDLING 2: the status is validated with a custom validation pipe in the controller
    // DETAILS: the save method stores the data in the db
    // RETURNS: a promise of an entity Task - the updated task
    const task = await this.getTaskById(id);
    task.status = status;
    await task.save();
    return task;
  }
}
