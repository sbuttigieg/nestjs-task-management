import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from '../auth/user.entity';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    // SCOPE 1: returns all tasks in the db when there are no filter parameters
    // SCOPE 2: returns the filtered tasks when there are filter parameters
    // ERROR HANDLING: none as the data was checked with 2 validation pipes in the controller
    // DETAILS 1: query builder is used to filter
    // DETAILS 2: the query starts by filtering by userId
    // DETAILS 3: then if status and/or search params are passed these are added to the query
    // DETAILS 3: andWhere is used when you need to add more filtering to the query
    // DETAILS 4: the query.getMany method is used to get all the resulting tasks in the query
    // RETURNS: since more than one task could be returned the output is a promise of an array of entity Task
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
    return await query.getMany();
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    // SCOPE: create a new task
    // ERROR HANDLING: none as the data was checked with a validation pipe in the controller
    // DETAILS 1: the id is automatically generated
    // DETAILS 2: the save method stores the data in the db
    // DETAILS 3: delete the user part of the task before returning it such as not to show the user details
    // RETURNS: a promise of an entity Task - the newly created task
    const task = new Task();
    const { title, description } = createTaskDto;
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    task.user = user;
    await task.save();
    delete task.user;
    return task;
  }
}
