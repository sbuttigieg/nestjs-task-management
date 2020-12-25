import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt/jwt-payload.interface';
import { UserRepository } from './user.repository';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  // SCOPE: creates a new user
  // ERROR HANDLING: none, data checked with 2 validation pipes in controller
  // DETAILS: the logic for this service is all in the repository
  // RETURNS: nothing, hence returns a void promise
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.userRepository.signUp(authCredentialsDto);
  }

  // SCOPE: validate user sign in
  // ERROR HANDLING: if username is not returned throw an exception
  // DETAILS 1: validates sign in data within the repository method that
  // DETAILS 2: returns back a username if successful or null if not
  // DETAILS 3: adds the returned username to the access token payload using
  // DETAILS 4: the JwtPayload interface
  // RETURNS:  a promise of accessToken
  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const username = await this.userRepository.validateUserPassword(
      authCredentialsDto,
    );
    if (!username) {
      this.logger.debug(
        `Invalid credentials for "${authCredentialsDto.username}" during sign-in, Error #1020`,
      );
      this.logger.error(`Invalid credentials during sign-in, Error #1020`);
      throw new UnauthorizedException('Invalid Credentials, Error #1020');
    }
    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.sign(payload);
    this.logger.debug(`Generated JWT token with payload for "${username}"`);
    return { accessToken };
  }
}
