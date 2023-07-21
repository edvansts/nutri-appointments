import { Type } from 'class-transformer';
import {
  Length,
  IsString,
  IsEnum,
  IsPhoneNumber,
  IsDate,
  Validate,
} from 'class-validator';
import {
  CIVIL_STATUS,
  ETHNICITY,
  GENDER,
  SCHOOLING,
  SEX,
} from 'src/constants/enum';
import { CPF_ERROR_MESSAGE } from 'src/constants/errors';
import { isValidCPF } from 'src/utils/validation';

export class CreatePatientDto {
  @IsString()
  @Length(4, 50)
  name: string;

  @Type(() => Date)
  @IsDate()
  birthdayDate: Date;

  @IsString()
  @IsEnum(SEX)
  sex: SEX;

  @IsString()
  @IsEnum(GENDER)
  gender: GENDER;

  @IsString()
  @IsEnum(CIVIL_STATUS)
  civilStatus: CIVIL_STATUS;

  @IsString()
  nationality: string;

  @IsString()
  naturality: string;

  @IsString()
  @IsEnum(ETHNICITY)
  ethnicity: ETHNICITY;

  @IsString()
  @IsEnum(SCHOOLING)
  schooling: SCHOOLING;

  @IsString()
  profession: string;

  @IsString()
  completeAddress: string;

  @IsString()
  @IsPhoneNumber('BR')
  phoneNumber: string;

  @IsString()
  @Validate((value: string) => isValidCPF(value), {
    message: CPF_ERROR_MESSAGE,
  })
  cpf: string;
}
