import { TaskStatus } from '../task.model';
import { IsIn, IsNotEmpty, IsOptional } from 'class-validator';

export class GetTasksFilterDto {
  @IsOptional()
  @IsIn(Object.values(TaskStatus))
  // in my solution I check directly to the TaskStatus enum rather than manually writing them in an array
  // in suggested solution: - @IsIn([TaskStatus.OPEN, TaskStatus.DONE, etc..])
  status: TaskStatus;

  @IsOptional()
  @IsNotEmpty()
  search: string;
}
