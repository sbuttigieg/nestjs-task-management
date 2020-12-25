import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthCredentialsDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  // NOTE 1a: password of length 8-20 characters
  // NOTE 1b: contains at least 1 upper case letter
  // NOTE 1c: contains at least 1 lower case letter
  // NOTE 1d: contains at least 1 number or special character
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  password: string;
}
