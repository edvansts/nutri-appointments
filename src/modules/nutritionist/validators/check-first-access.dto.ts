import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CheckFirstAccessDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Date)
  @IsDate()
  birthdayDate: Date;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  crn: string;
}
