import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { UserRepository } from '../user.repository';
import { User } from '../user.entity';

// Note 1a: Strategy name was added such as to explicitly link
// Note 1b: the AuthGuard to this strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private logger = new Logger('JwtStrategy');
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'topSecret51',
    });
  }

  // SCOPE: validates payload
  // ERROR HANDLING: if user is not found throw UnauthorisedException
  // DETAILS 1: Retrieve the username from the payload
  // DETAILS 2: Find the user that matches the username
  // RETURNS: a promise of an entity User - the authorised user
  // BUG 1a: ERROR #1000 could not be simulated. When user is not signed in,
  // BUG 1b: the error is thrown before it reaches this method
  async validate(payload: JwtPayload): Promise<User> {
    const { username } = payload;
    const user = await this.userRepository.findOne({ username });
    if (!user) {
      this.logger.debug(`User "${user.username}" not found, Error #1000`);
      this.logger.error(`User not found, Error #1000`);
      throw new UnauthorizedException('Error #1000');
    }
    this.logger.debug(`JWT payload validated for "${user.username}"`);
    return user;
  }
}
