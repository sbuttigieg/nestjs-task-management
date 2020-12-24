import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  // SCOPE: creates a new user
  // ERROR HANDLING: none as the data was checked with 2 validation pipes in the controller
  // DETAILS: the logic for this service is all in the repository
  // RETURNS: nothing, hence returns a void promise
  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.userRepository.signUp(authCredentialsDto);
  }

  // SCOPE: validate user sign in
  // ERROR HANDLING: if username is not returned throw an exception
  // DETAILS 1: validates sign in data within the repository method that returns back a
  // DETAILS 2: username if successful or null if not
  // DETAILS 3: adds the returned username to the access token payload (uses JwtPayload interface)
  // RETURNS:  a promise of accessToken
  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const username = await this.userRepository.validateUserPassword(
      authCredentialsDto,
    );
    if (!username) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const payload: JwtPayload = { username };
    const accessToken = await this.jwtService.sign(payload);
    return { accessToken };
  }
}
