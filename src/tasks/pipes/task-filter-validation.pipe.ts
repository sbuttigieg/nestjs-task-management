import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PipeTransform } from '@nestjs/common';
import { TaskFilters } from '../task.enum';

// NOTE 1a: I added this custom validation pipe to make sure that the query
// NOTE 1b: keys are valid. Without this validation, the primary validation
// NOTE 1c: pipe would just ignore the incorrect query key, meaning that the
// NOTE 1d: client would not be informed that the incorrect query is ignored.
export class TaskFilterValidationPipe implements PipeTransform {
  private logger = new Logger('TaskFilterValidationPipe');
  transform(queryKeys: string[]) {
    // NOTE 2a: each query key received is compared to the keys in the
    // NOTE 2b: TaskFilters enum
    try {
      Object.keys(queryKeys).forEach(function (filterKey) {
        if (!Object.keys(TaskFilters).includes(filterKey.toUpperCase())) {
          throw new NotFoundException(`${filterKey}`);
        }
      });
      this.logger.debug(`Filter keys "${Object.keys(queryKeys)}" validated`);
      return queryKeys;
    } catch (error) {
      this.logger.debug(`Incorrect filter key "${error.message}", Error #2020`);
      this.logger.error(`Incorrect filter key, Error #2020`);
      throw new BadRequestException(
        'Incorrect filter parameter key, Error #2020',
      );
    }
  }
}
