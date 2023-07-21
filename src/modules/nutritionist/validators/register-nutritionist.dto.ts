import { ApiHideProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  Length,
  IsString,
  MinLength,
  IsBoolean,
  IsOptional,
  Validate,
  IsDate,
} from 'class-validator';
import { CPF_ERROR_MESSAGE } from 'src/constants/errors';
import { isValidCPF } from 'src/utils/validation';

export class RegisterNutritionistDto {
  @IsString()
  @Length(4, 50)
  name: string;

  @IsString()
  @MinLength(5)
  crn: string;

  @IsString()
  @Validate((value: string) => isValidCPF(value), {
    message: CPF_ERROR_MESSAGE,
  })
  cpf: string;

  @ApiHideProperty()
  @IsBoolean()
  @IsOptional()
  isCreator?: boolean;

  @Type(() => Date)
  @IsDate()
  birthdayDate: Date;
}
