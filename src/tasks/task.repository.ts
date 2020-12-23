import { EntityRepository, Repository } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task.enum';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

@EntityRepository(Task)
export class TaskRepository extends Repository<Task> {
  async getTasks(filterDto: GetTasksFilterDto): Promise<Task[]> {
    // SCOPE 1: returns all tasks in the db when there are no filter parameters
    // SCOPE 2: returns the filtered tasks when there are filter parameters
    // ERROR HANDLING: none as the data was checked with 2 validation pipes in the controller
    // DETAILS 1: query builder is used to filter
    // DETAILS 2: if status and/or search params are passed these are used in the query
    // DETAILS 3: andWhere is used instead of where so that both status and search could be used in the same query
    // DETAILS 4: the query.getMany method is used to get all the resulting tasks in the query
    // RETURNS: since more than one task could be returned the output is a promise of an array of entity Task
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
    return await query.getMany();
  }

  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    // SCOPE: create a new task
    // ERROR HANDLING: none as the data was checked with a validation pipe in the controller
    // DETAILS 1: the id is automatically generated
    // DETAILS 2: the save method stores the data in the db
    // RETURNS: a promise of an entity Task - the newly created task
    const task = new Task();
    const { title, description } = createTaskDto;
    task.title = title;
    task.description = description;
    task.status = TaskStatus.OPEN;
    await task.save();
    return task;
  }
}
