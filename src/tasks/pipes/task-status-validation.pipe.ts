import { BadRequestException, Logger, PipeTransform } from '@nestjs/common';
import { TaskStatus } from '../task.enum';

// NOTE 1a: I added this custom validation pipe to make sure that both the query
// NOTE 1b: keys and values are valid.
// NOTE 2:  No dto was used since the body only has one parameter.
// NOTE 3a: If the status key is missing or mistyped, the value is undefined and
// NOTE 3b: thus a missing status error is thrown.
// NOTE 4a: If the status value is not a correct TaskStatus an invalid status
// NOTA 4b: error is thrown.
export class TaskStatusValidationPipe implements PipeTransform {
  private logger = new Logger('TaskStatusValidationPipe');
  transform(value: TaskStatus) {
    if (value) {
      if (!Object.values(TaskStatus).includes(value)) {
        this.logger.debug(`Invalid task status "${value}", Error #2030`);
        this.logger.error(`Invalid task status, Error #2030`);
        throw new BadRequestException(`Invalid task status, Error #2030`);
      }
    } else {
      this.logger.debug(`Missing task status, Error #2040`);
      this.logger.error(`Missing task status, Error #2040`);
      throw new BadRequestException('Missing status, Error #2040');
    }
    this.logger.debug(`Task Status "${value}" validated`);
    return value;
  }
}
