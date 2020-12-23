// used to validate the filter keys in the body
export enum TaskFilters {
  STATUS = 'status',
  SEARCH = 'search',
}

// used to validate that the Task Status is one of 3 options
export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
