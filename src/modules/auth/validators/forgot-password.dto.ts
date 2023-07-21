import { IsEmail, IsString, Validate } from 'class-validator';
import { CPF_ERROR_MESSAGE, EMAIL_ERROR_MESSAGE } from 'src/constants/errors';
import { isValidCPF } from 'src/utils/validation';

export class ForgotPasswordDto {
  @IsString()
  @Validate((value: string) => isValidCPF(value), {
    message: CPF_ERROR_MESSAGE,
  })
  cpf: string;

  @IsString()
  @IsEmail(undefined, { message: EMAIL_ERROR_MESSAGE })
  email: string;
}
