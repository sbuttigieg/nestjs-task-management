import { ConflictException, Logger } from '@nestjs/common';
import { InternalServerErrorException } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  private logger = new Logger('UserRepository');
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    // SCOPE: creates a new user
    // ERROR HANDLING 1a: no validation on inputs as the data was checked with
    // ERROR HANDLING 1b: 2 validation pipes in the controller
    // ERROR HANDLING 2a: if the save method fails due to non-unique username
    // ERROR HANDLING 2b: a Conflict error is thrown
    // ERROR HANDLING 3: Otherwise an internal server error is thrown
    // DETAILS 1a: retrieves username & password from the input DTO and
    // DETAILS 1b: creates a new User. Instead of just saying new user, we
    // DETAILS 1c: use the this.create() method. This will have the same
    // DETAILS 1d: effect since the class extends Repository<User> and thus a
    // DETAILS 1e: User entity will be created. This make it testable as the
    // DETAILS 1f: create() method can be mocked
    // DETAILS 3: a new random salt is generated and stored for every new user
    // DETAILS 4: the password is generated by hashing the password wih the salt
    // DETAILS 5: the save method stores the data in the db
    // RETURNS: nothing, hence returns a void promise
    const { username, password } = authCredentialsDto;
    const user = this.create();
    user.username = username;
    user.salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, user.salt);
    try {
      await user.save();
      this.logger.debug(`New user "${user.username}" signed up successfully`);
    } catch (error) {
      if (error.code === '23505') {
        this.logger.debug(
          `Username "${user.username}" already exists, Error #1030`,
        );
        this.logger.error(`Username already exists, Error #1030`);
        throw new ConflictException('Username already exists, Error #1030');
      } else {
        this.logger.debug(
          `Error while saving new user "${user.username}", Error #1040`,
        );
        this.logger.error(`Error while saving new user, Error #1040`);
        throw new InternalServerErrorException('Error #1040');
      }
    }
  }

  // SCOPE: validate password
  // ERROR HANDLING: performed in the service when/if a null is returned
  // DETAILS 1: retrieves username and password from the input DTO
  // DETAILS 2: find user that matches the username with findOne method
  // DETAILS 3: if user exists and password matches return the username
  // DETAILS 4: otherwise return null
  // RETURNS: a promise of a string - username or null
  async validateUserPassword(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<string> {
    const { username, password } = authCredentialsDto;
    const user = await this.findOne({ username });
    if (user && (await user.validatePassword(password))) {
      this.logger.debug(`Password for "${user.username}" validated`);
      return user.username;
    } else if (user) {
      this.logger.debug(`Password for "${username}" failed`);
      return null;
    } else {
      this.logger.debug(`User "${username}" does not exist`);
      return null;
    }
  }

  // SCOPE: hash password
  // ERROR HANDLING: none
  // DETAILS: hashes the password with the salt
  // RETURNS: a promise of a string - the hashed password
  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }
}
