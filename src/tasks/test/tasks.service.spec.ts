import { Test } from '@nestjs/testing';
import { TasksService } from '../tasks.service';
import { TaskRepository } from '../task.repository';
import { GetTasksFilterDto } from '../dto/get-tasks-filter.dto';
import { TaskStatus } from '../task.enum';
import { NotFoundException } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateTaskDto } from '../dto/create-task.dto';

// NOTE 1a: Create a mock user and a mock Task Repository with jest functions
const mockUser = { id: 1, username: 'Test user', password: '123', salt: '123' };
// NOTE 1b: Create a mock Task Repository. The jest functions will be used to
// NOTE 1c: detect if the Task Repository methods are called.
const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});
// *****************************************************************************
describe('TasksService', () => {
  let tasksService;
  let taskRepository;

  // NOTE 1d: Initiate a testing module with the real TasksService and a mock
  // NOTE 1e: TaskRepository. These will be used to test all service methods.
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();
    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });
  // ***************************************************************************
  describe('getTasks', () => {
    it('gets tasks from the repository', async () => {
      // NOTE 2a: Create a mock filter input
      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'some search query',
      };
      // NOTE 2b: Create a mock result from taskRepository.getTasks
      taskRepository.getTasks.mockResolvedValue(Promise.resolve('someValue'));
      // NOTE 2c: Check that task repo is not called before calling getTasks()
      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      // NOTE 2d: Call the tasksService.getTasks
      const result = await tasksService.getTasks(filters, mockUser);
      // NOTE 2e: Check that task repo is called with correct parameters
      expect(taskRepository.getTasks).toHaveBeenCalledWith(filters, mockUser);
      // NOTE 2f: Check that the returned value matches the mock result.
      // NOTE 2g: Testing does not confirm the output is a correct Task Object
      expect(result).toEqual('someValue');
    });
  });
  // ***************************************************************************
  describe('getTaskById', () => {
    it('calls taskRepo.findOne() & successfully retrieve & return the task', async () => {
      // NOTE 3a: Create a mock result from taskRepository.findOne
      const mockTask = { title: 'Test task', description: 'Test desc' };
      taskRepository.findOne.mockResolvedValue(Promise.resolve(mockTask));
      // NOTE 3b: Check that findOne() isn't called before calling getTasksById
      expect(taskRepository.findOne).not.toHaveBeenCalled();
      // NOTE 3c: Call the tasksService.getTaskById
      const result = await tasksService.getTaskById(1, mockUser);
      // NOTE 3d: Check that task repo is called with correct parameters
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: mockUser.id },
      });
      // NOTE 3e: Check that the returned value matches the mock result.
      // NOTE 3f: Testing does not confirm the output is a correct Task Object
      expect(result).toEqual(mockTask);
    });
    it('throws an error if task is not found', () => {
      // NOTE 4a: Create a null mock result from taskRepository.findOne()
      taskRepository.findOne.mockResolvedValue(Promise.resolve(null));
      // NOTE 4b: Check that getTaskById returns a specific error
      expect(tasksService.getTaskById(1, mockUser)).rejects.toThrow(
        new NotFoundException(`ID not found, Error #2050`),
      );
    });
  });
  // ***************************************************************************
  describe('createTask', () => {
    it('calls taskRepository.createTask() & returns the result', async () => {
      // NOTE 5a: Create a mock new task input
      const newTask: CreateTaskDto = {
        title: 'test title',
        description: 'test description',
      };
      // NOTE 5b: Create a mock result from taskRepository.createTask
      taskRepository.createTask.mockResolvedValue(Promise.resolve('someValue'));
      // NOTE 5c: Check that task repo is not called before calling createTask()
      expect(taskRepository.createTask).not.toHaveBeenCalled();
      // NOTE 5d: Call the tasksService.createTask
      const result = await tasksService.createTask(newTask, mockUser);
      // NOTE 5e: Check that task repo is called with correct parameters
      expect(taskRepository.createTask).toHaveBeenCalledWith(newTask, mockUser);
      // NOTE 5f: Check that the returned value matches the mock result.
      // NOTE 5g: Testing does not confirm the output is a correct Task Object
      expect(result).toEqual('someValue');
    });
  });
  // ***************************************************************************
  describe('deleteTask', () => {
    it('calls taskRepo.delete() & successfully delete a task', async () => {
      // NOTE 6a: Create a mock result from taskRepository.delete
      const mockResult = { raw: 'Test raw', affected: 1 };
      taskRepository.delete.mockResolvedValue(Promise.resolve(mockResult));
      // NOTE 6b: Check that task repo isn't called before calling deleteTask()
      expect(taskRepository.delete).not.toHaveBeenCalled();
      // NOTE 6c: Call the tasksService.deleteTask
      await tasksService.deleteTask(1, mockUser);
      // NOTE 6d: Check that task repo is called with correct parameters
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
    });
    it('throws an error if task is not found', () => {
      // NOTE 7a: Create a null mock result from taskRepository.delete
      taskRepository.delete.mockResolvedValue(
        Promise.resolve({ raw: null, affected: 0 }),
      );
      // NOTE 7b: Check that deleteTask() returns a specific error
      expect(tasksService.deleteTask(1, mockUser)).rejects.toThrow(
        new NotFoundException(`ID not found, Error #2060`),
      );
    });
  });
  // ***************************************************************************
  describe('updateTaskStatus', () => {
    it('gets a task and update its status', async () => {
      // NOTE 8a: Create a mock save() that returns a promise of a true result
      const save = jest.fn().mockResolvedValue(Promise.resolve(true));
      // NOTE 8b: Create a mockTask that has a status of open
      const mockTask = { status: TaskStatus.OPEN };
      // NOTE 8c: Create a mock getTaskById()
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        mockTask,
        save,
      });
      // NOTE 8d: Check that getTaskById isn't called before calling UpdateTaskS
      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      // NOTE 8e: Check that save() isn't called before calling UpdateTaskStatus
      expect(save).not.toHaveBeenCalled();
      // NOTE 8f: Call the tasksService.updateTaskStatus()
      const result = await tasksService.updateTaskStatus(
        1,
        TaskStatus.DONE,
        mockUser,
      );
      // NOTE 8g: Check that getTaskById() is called with correct parameters
      expect(tasksService.getTaskById).toHaveBeenCalledWith(1, mockUser);
      // NOTE 8h: Check that save() is called
      expect(save).toHaveBeenCalled();
      // NOTE 8i: Check that the returned status has been changed to DONE
      // NOTE 8j: Testing does not confirm the output is a correct Task Object
      expect(result.status).toEqual(TaskStatus.DONE);
    });
    it('throws an error while saving task status update', async () => {
      // NOTE 9a: Create a mockTask that has a status of open
      const mockTask = { status: TaskStatus.OPEN };
      // NOTE 9b: Create a mock getTaskById() that has no save method
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        mockTask,
      });
      // NOTE 9d: Check that updateTaskStatus() returns a specific error
      await expect(
        tasksService.updateTaskStatus(1, TaskStatus.DONE, mockUser),
      ).rejects.toThrow(new InternalServerErrorException('Error #2070'));
    });
  });
  // ***************************************************************************
  // // Sample test structure
  // describe('getTasks', () => {
  //   it('gets all tasks from the repository', async () => {
  //     //
  //   });
  // });
});
