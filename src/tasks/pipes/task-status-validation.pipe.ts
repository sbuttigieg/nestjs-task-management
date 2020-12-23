import { BadRequestException, PipeTransform } from '@nestjs/common';
import { TaskStatus } from '../task.enum';

export class TaskStatusValidationPipe implements PipeTransform {
  // I added this custom validation pipe to make sure that both the query keys and values are valid
  // No dto was used since the body only has one parameter
  // if the status key is missing or mistyped, the value is undefined and thus a missing status error is thrown
  // if the status value is not a correct TaskStatus an invalid status error is thrown
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
