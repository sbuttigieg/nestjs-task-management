import { BadRequestException, PipeTransform } from '@nestjs/common';
import { TaskStatus } from '../task-status.enum';

export class TaskStatusValidationPipe implements PipeTransform {
  transform(value: TaskStatus) {
    if (value) {
      if (!Object.values(TaskStatus).includes(value)) {
        throw new BadRequestException(`--${value}-- is an invalid status`);
      }
    } else {
      throw new BadRequestException('missing status');
    }
    return value;
  }
}
