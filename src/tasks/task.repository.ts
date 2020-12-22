import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  // NOTE: async defines that a method is asynchronous. All async methods return a Promise

  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    // here no error handling is included as the data was checked with a validation pipe in the controller
    // returns all tasks in the db when there are no filter parameters
    // returns the filtered tasks when there are filter parameters
    // since more than one task could be returned the output is an array of tasks
    // query builder is used to filter
    // if status and/or search params are passed these are used in the query
    // andWhere is used instead of where so that both status and search could be used in the same query
    // the query.getMany method is used to get all the resulting tasks in the query
    const { status, search } = filterDto;
    const query = this.createQueryBuilder('task');
    if (status) {
      query.andWhere('task.status = :status', { status });
    }
    if (search) {
      query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` },
      );
    }
    const tasks = await query.getMany();
    return tasks;
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    // retrieves title and description from the input DTO and creates a new Task with a default status Open
    // here no error handling is included as the data was checked with a validation pipe in the controller
    // the id is automatically generated
    // the save method stores the data in the db
    const task = new Task();
    const { title, description } = createTaskDto;
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    await task.save();
    return task;
  }
}
