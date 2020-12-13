import { BadRequestException, PipeTransform } from '@nestjs/common';
import { TaskStatus } from '../task.model';

export class TaskStatusValidationPipe implements PipeTransform {
  // in the suggested solution, an array is created with the allowedStatuses from the TaskStatus enum values
  // consequently this validation pipe would have a method that compares the received status value to this array
  // this was probably done to show the full capabilities of a custom validation pipe

  // in my solution I compared directly with the enum values as I think it is more efficient

  // readonly allowedStatuses = [
  //   TaskStatus.OPEN,
  //   TaskStatus.IN_PROGRESS,
  //   TaskStatus.DONE,
  // ];

  transform(value: any) {
    // value = value.toUpperCase();
    // if (!this.isStatusValid(value)) {
    //   throw new BadRequestException(`--${value}-- is an invalid status`);
    // }

    if (!Object.values(TaskStatus).includes(value.toUpperCase())) {
      throw new BadRequestException(`--${value}-- is an invalid status`);
    }
    return value;
  }

  // private isStatusValid(status: any) {
  //   const index = this.allowedStatuses.indexOf(status);
  //   return index != 1;
  // }
}
