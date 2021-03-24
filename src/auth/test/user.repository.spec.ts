import { Test } from '@nestjs/testing';
import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import { UserRepository } from '../user.repository';

// NOTE 1a: Create a mock signup user
const mockCredentialsDto: AuthCredentialsDto = {
  username: 'testUsername',
  password: 'testPassword',
};

describe('UserRepository', () => {
  let userRepository;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [userRepository],
    }).compile();
    userRepository = await module.get<UserRepository>(UserRepository);
  });
  // ***************************************************************************
  describe('signUp', () => {
    beforeEach(() => {
      //
    });
    it('signup a new user successfully', async () => {
      // NOTE 1a: Create a mock user
      const mockUser = { id: 1, username: 'Test user', password: '123', salt: '123' };
      // NOTE 2a: Create a mock save() that returns a promise of a true result
      const create = jest.fn().mockResolvedValue(Promise.resolve(mockUser));
      // NOTE 2a: Create a mock save() that returns a promise of a true result
      const save = jest.fn().mockResolvedValue(Promise.resolve(true));
      // NOTE 1a: Create a mock signup user

    });
    it('throws an error is user already exists', async () => {
      //
    });
    it('throws an error while saving new user', async () => {
      //
    });
  });
  // ***************************************************************************
  describe('validateUserPassword', () => {
    it('gets all tasks from the repository', async () => {
      //
    });
  });
});
