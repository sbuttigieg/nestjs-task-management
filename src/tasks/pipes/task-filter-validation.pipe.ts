import { BadRequestException, PipeTransform } from '@nestjs/common';
import { TaskFilters } from '../task.model';

export class TaskFilterValidationPipe implements PipeTransform {
  // I added this custom validation pipe to make sure that the query keys are valid
  // Without this validation, the primary validation pipe would just ignore the incorrect query key
  // This would mean that the client would not be informed that the incorrect query is ignored

  transform(queryKeys: string[]) {
    // each query key received is compared to the keys in the TaskFilters enum
    Object.keys(queryKeys).forEach(function (filterKey) {
      if (!Object.keys(TaskFilters).includes(filterKey.toUpperCase())) {
        throw new BadRequestException(
          `--${filterKey}-- is not an accepted filter parameter`,
        );
      }
    });
    return queryKeys;
  }
}
