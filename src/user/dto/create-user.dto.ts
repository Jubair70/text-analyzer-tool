import { IsEmail, IsString,MinLength,MaxLength,Matches } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(20)
  // At least one uppercase letter, one lowercase letter, and one number
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/, {
    message:
      'password too weak. It must contain at least one uppercase letter, one lowercase letter, and one number.',
  })
  password: string;
}
