import { IsEmail, IsString, Length } from 'class-validator';
import { CheckFirstAccessDto } from './check-first-access.dto';

export class FirstAccessSetupDto extends CheckFirstAccessDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 30)
  password: string;
}
