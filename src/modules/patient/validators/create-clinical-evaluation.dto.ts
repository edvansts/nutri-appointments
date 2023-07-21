import { Type } from 'class-transformer';
import { IsString, IsEnum, IsOptional, IsArray, IsDate } from 'class-validator';
import {
  ALCOHOLIC_STATUS,
  CLINICAL_HISTORY,
  EATING_BEHAVIOR,
  EATING_PLACE,
  ENVIRONMENT,
  FAMILIAR_BACKGROUND,
  SMOKER_STATUS,
  SYMPTOM,
} from 'src/constants/enum';

export class CreateClinicalEvaluationDto {
  @IsString()
  medicationsAndSupplementsUsed: string;

  @IsString()
  weightLossTreatmentsPerformed: string;

  @IsString()
  @IsEnum(SMOKER_STATUS)
  smokerStatus: SMOKER_STATUS;

  @IsString()
  @IsOptional()
  smokerDescription?: string;

  @IsString()
  @IsEnum(ALCOHOLIC_STATUS)
  alcoholicStatus: ALCOHOLIC_STATUS;

  @IsString()
  @IsOptional()
  alcoholicDescription?: string;

  @IsString()
  physicalActivityDescription: string;

  @IsString()
  spareTimeDescription: string;

  @IsString()
  @IsEnum(EATING_BEHAVIOR)
  eatingBehavior: EATING_BEHAVIOR;

  @IsString()
  @IsEnum(EATING_PLACE)
  breakfastPlace: EATING_PLACE;
  @IsString()
  @IsEnum(EATING_PLACE)
  snackPlace: EATING_PLACE;
  @IsString()
  @IsEnum(EATING_PLACE)
  lunchPlace: EATING_PLACE;
  @IsString()
  @IsEnum(EATING_PLACE)
  afternoonSnackPlace: EATING_PLACE;
  @IsString()
  @IsEnum(EATING_PLACE)
  dinnerPlace: EATING_PLACE;
  @IsString()
  @IsEnum(EATING_PLACE)
  supperPlace: EATING_PLACE;

  @IsString()
  @IsEnum(ENVIRONMENT)
  mainMealsEnvironment: ENVIRONMENT;

  @IsArray()
  @IsEnum(FAMILIAR_BACKGROUND, { each: true })
  familiarBackground: FAMILIAR_BACKGROUND[];

  @IsString()
  @IsOptional()
  otherFamiliarBackgrounds?: string;

  @IsArray()
  @IsEnum(CLINICAL_HISTORY, { each: true })
  clinicalHistory: CLINICAL_HISTORY[];

  @IsString()
  @IsOptional()
  otherClinicalHistories?: string;

  @IsArray()
  @IsEnum(SYMPTOM, { each: true })
  reportedSymptoms: SYMPTOM[];

  @IsString()
  @IsOptional()
  otherReportedSymptoms?: string;

  @Type(() => Date)
  @IsDate()
  examDate: Date;
}
