import { Injectable, NotFoundException } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import { v1 as uuid_v1 } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
// import { UpdateTaskStatusDto } from './dto/update-task-status.dto';

@Injectable()
export class TasksService {
  // since there is no db tasks are stored in an array
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    // returns all tasks in the array
    // NOTE: this methode nad the getTasksWithFilters method can be combined
    // However not sure if this was done on purpose for a future part of the course
    return this.tasks;
  }

  getTasksWithFilters(filterDto: GetTasksFilterDto): Task[] {
    // here no error handling is included as the data was checked with a validation pipe in the controller
    // the arrayName.filter method is used to delete the tasks not matching the filter
    // as the items are deleted if the function returns a false
    const { status, search } = filterDto;
    let tasks = this.getAllTasks();
    // tasks not having a matching status are removed
    if (status) {
      tasks = tasks.filter((task) => task.status === status);
    }
    // tasks not having the search term included in either the title or description are removed
    if (search) {
      tasks = tasks.filter(
        (task) =>
          task.title.includes(search) || task.description.includes(search),
      );
    }
    return tasks;
  }

  getTaskById(id: string): Task {
    // returns the task that matches the id using the arrayName.find method using arrow function
    // if the task does not exist a new exception is thrown
    // using this method in other methods is useful as the error handing is done once
    const found = this.tasks.find((task) => task.id === id);
    if (!found) {
      throw new NotFoundException(`ID --${id}-- not found`);
    }
    return found;
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    // here no error handling is included as the data was checked with a validation pipe in the controller
    // retrieves title and description from the input DTO and creates a new Task with a default status Open
    // and a newly created uuid of type v1
    // arrayName.push method is used to add 'task' to the 'tasks' and finally returns the newly created task
    const { title, description } = createTaskDto;
    const task: Task = {
      id: uuid_v1(),
      title,
      description,
      status: TaskStatus.OPEN,
    };
    this.tasks.push(task);
    return task;
  }

  deleteTask(id: string): void {
    // my original solution
    // retrieve the index of the task that matches the id using the arrayName.findIndex method
    // This method returns -1 if no match is found (this would never happen if we use the getTaskByID method)
    // the task for the index is deleted using the arrayName.splice method
    // const index = this.tasks.findIndex((task) => task.id === id);
    // if (index !== -1) {
    //   this.tasks.splice(index, 1);
    // }
    // return this.tasks;

    // my solution with added getTaskByID method
    // const found = this.getTaskById(id);
    // const index = this.tasks.findIndex((task) => task.id === found.id);
    // this.tasks.splice(index, 1);
    // return this.tasks;

    // in the suggested solution, the arrayName.filter method is used to delete the task
    // in filter, the item is deleted if the function returns a false
    // thus we filter where id DOES NOT match the task.id
    // the task id is validated within the getTaskById method
    // also the function does not return anything thus set to void
    // my preference was to return the task array contents after deletion
    const found = this.getTaskById(id);
    this.tasks = this.tasks.filter((task) => task.id !== found.id);
  }

  updateTaskStatus(id: string, status: TaskStatus): Task {
    // my original solution was to create a dto and use it to
    // pass the change in status but the suggested solution was
    // not to use a dto as it only had one parameter
    // updateTaskStatus(id: string, updateTaskStatusDto: UpdateTaskStatusDto): Task {
    //   const task = this.getTaskById(id);
    //   const { status } = updateTaskStatusDto;
    //   task.status = status;
    //   return task;
    // }

    // suggested solution uses a custom validation pipe to verify that the status is correct
    // the task id is validated within the getTaskById method
    const task = this.getTaskById(id);
    task.status = status;
    return task;
  }
}
