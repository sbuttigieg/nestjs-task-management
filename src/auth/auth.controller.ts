import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { AuthSignupValidationPipe } from './pipes/auth-signup-validation.pipe';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // SCOPE: Request to sign up a new user
  // ERROR HANDLING 1: First the keys in the body are validated using a custom validation pipe AuthSignupValidationPipe
  // ERROR HANDLING 2: Secondly the param in the body are validated using a validation pipe to the AuthCredentialsDto
  // RETURNS: nothing, hence returns a void promise
  @Post('/signup')
  signUp(
    @Body(AuthSignupValidationPipe, ValidationPipe)
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<void> {
    return this.authService.signUp(authCredentialsDto);
  }

  // SCOPE: Request to sign in a user
  // ERROR HANDLING 1: First the keys in the body are validated using a custom validation pipe AuthSignupValidationPipe
  // ERROR HANDLING 2: Secondly the param in the body are validated using a validation pipe to the AuthCredentialsDto
  // RETURNS: the access token
  @Post('/signIn')
  // @UseGuards(AuthGuard())
  signIn(
    @Body(AuthSignupValidationPipe, ValidationPipe)
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDto);
  }

  @Post('/test')
  @UseGuards(AuthGuard())
  test(@GetUser() user: User) {
    console.log(user);
  }
}
