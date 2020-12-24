import { BadRequestException, PipeTransform } from '@nestjs/common';
import { signUp } from '../auth.enum';

// I added this custom validation pipe to make sure that the query keys for signup are valid
// Without this validation, system would just return a 500 error
export class AuthSignupValidationPipe implements PipeTransform {
  transform(queryKeys: string[]) {
    // each query key received is compared to the keys in the signUp enum
    Object.keys(queryKeys).forEach(function (filterKey) {
      if (!Object.keys(signUp).includes(filterKey.toUpperCase())) {
        throw new BadRequestException(
          `--${filterKey}-- is not an accepted filter parameter`,
        );
      }
    });
    return queryKeys;
  }
}
