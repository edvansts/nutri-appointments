import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Validate,
} from 'class-validator';
import { CPF_ERROR_MESSAGE } from 'src/constants/errors';
import { ROLE } from 'src/constants/user';
import { isValidCPF } from 'src/utils/validation';

export class CreateUserDto {
  @IsString()
  @Length(4, 50)
  name: string;

  @IsString()
  @Validate((value: string) => isValidCPF(value), {
    message: CPF_ERROR_MESSAGE,
  })
  cpf: string;

  @IsEnum(ROLE)
  role: ROLE;

  @IsBoolean()
  @IsOptional()
  isCreator?: boolean;

  @Type(() => Date)
  @IsDate()
  birthdayDate: Date;
}
