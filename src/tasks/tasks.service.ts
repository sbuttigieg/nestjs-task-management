import { Injectable } from '@nestjs/common';
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
    return this.tasks;
  }

  getTasksWithFilters(filterDto: GetTasksFilterDto): Task[] {
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
    // returns the task that matches the id
    return this.tasks.find((task) => task.id === id);
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;
    const task: Task = {
      id: uuid_v1(),
      title,
      description,
      status: TaskStatus.OPEN,
    };

    // push adds 'task' to the 'tasks' array of type 'Task'
    this.tasks.push(task);
    return task;
  }

  deleteTask(id: string): void {
    // returns the index of the task that matches the id, returns -1 if no match is found
    // const index = this.tasks.findIndex((task) => task.id === id);
    // if (index !== -1) {
    //   this.tasks.splice(index, 1);
    // }
    // return this.tasks;

    // in the suggested solution, the filter is used to delete the task
    // in filter, the item is deleted if the function returns a false
    // thus we filter where id DOES NOT match the task.id
    // also the function does not return anything this void
    // my preference was to return the task array contents after deletion
    this.tasks = this.tasks.filter((task) => task.id !== id);
  }

  // my original solution was to create a dto and use it to
  // pass the change in status but the suggested solution was
  // not to use a dto as it only had one parameter
  // updateTaskStatus(id: string, updateTaskStatusDto: UpdateTaskStatusDto): Task {
  //   const task = this.getTaskById(id);
  //   const { status } = updateTaskStatusDto;
  //   task.status = status;
  //   return task;
  // }
  updateTaskStatus(id: string, status: TaskStatus): Task {
    const task = this.getTaskById(id);
    task.status = status;
    return task;
  }
}
