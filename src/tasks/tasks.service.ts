import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
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

  // NOTE: async defines that a method is asynchronous. All async methods return a Promise

  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    // returns all tasks in the db when there are no filter parameters
    // returns the filtered tasks when there are filter parameters
    // here no error handling is included as the data was checked with a validation pipe in the controller
    // the logic for this service is all in the repository
    // the getTasks method returns a promise of an array of entities
    return this.taskRepository.getTasks(filterDto);
  }

  async getTaskById(id: number): Promise<Task> {
    // returns the task that matches the id using the findOne method
    // if the task does not exist a new exception is thrown
    // the findOne method returns a promise of an entity
    const found = await this.taskRepository.findOne(id);
    if (!found) {
      throw new NotFoundException(`ID --${id}-- not found`);
    }
    return found;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    // returns the newly created task
    // here no error handling is included as the data was checked with a validation pipe in the controller
    // the logic for this service is all in the repository
    // the createTask method returns a promise of an entity
    return this.taskRepository.createTask(createTaskDto);
  }

  async deleteTask(id: number): Promise<void> {
    // deletes the task that matches the id using the delete method
    // the delete method returns an affected param that specifies the number of entities deleted
    // if no entities were deleted then the entity for the id did not exist and so we return an error
    // since this method does not return anything, its output is set to Promise<void>
    const found = await this.taskRepository.delete(id);
    if (found.affected === 0) {
      throw new NotFoundException(`ID --${id}-- not found`);
    }
  }

  async updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    // updates the status parameter of a task defined by the id
    // the task id is validated within the getTaskById method
    // a custom validation pipe is used to verify that the status is correct
    // this method returns a promise of an entity
    // the save method stores the data in the db
    const task = await this.getTaskById(id);
    task.status = status;
    await task.save();
    return task;
  }
}
