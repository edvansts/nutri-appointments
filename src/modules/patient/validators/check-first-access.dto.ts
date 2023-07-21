import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, Validate } from 'class-validator';
import { CPF_ERROR_MESSAGE } from 'src/constants/errors';
import { isValidCPF } from 'src/utils/validation';

export class CheckFirstAccessDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Date)
  @IsDate()
  birthdayDate: Date;

  @IsString()
  @Validate((value: string) => isValidCPF(value), {
    message: CPF_ERROR_MESSAGE,
  })
  cpf: string;
}
