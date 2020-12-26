import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { PipeTransform } from '@nestjs/common';
import { signUp } from '../auth.enum';

// NOTE 1a: I added this custom validation pipe to make sure that the query
// NOTE 1b: keys for signup are valid. Without this validation, system would
// NOTE 1c: just return a 500 error
export class AuthSignupValidationPipe implements PipeTransform {
  private logger = new Logger('AuthSignupValidationPipe');
  transform(queryKeys: string[]) {
    // NOTE 2a: each query key received is compared to the keys in the
    // NOTE 2b: signUp enum
    try {
      Object.keys(queryKeys).forEach(function (filterKey) {
        if (!Object.keys(signUp).includes(filterKey.toUpperCase())) {
          throw new NotFoundException(`${filterKey}`);
        }
      });
      this.logger.debug(`Filter keys "${Object.keys(queryKeys)}" validated`);
      return queryKeys;
    } catch (error) {
      this.logger.debug(`Incorrect filter key "${error.message}", Error #1010`);
      this.logger.error(`Incorrect filter key, Error #1010`);
      throw new BadRequestException(
        'Incorrect filter parameter key, Error #1010',
      );
    }
  }
}
