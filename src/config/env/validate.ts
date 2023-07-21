import { Type, plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export enum Environment {
  development = 'development',
  production = 'production',
  test = 'test',
  stage = 'stage',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @IsOptional()
  PORT?: number;

  @IsString()
  DB_HOST: string;
  @IsString()
  DB_PORT: string;
  @IsString()
  DB_USER: string;
  @IsString()
  DB_PASSWORD: string;
  @IsString()
  DB_NAME: string;

  @IsString()
  USER_AUTH_SECRET: string;

  @IsString()
  EXPO_ACCESS_TOKEN: string;

  @IsString()
  CLOUDINARY_CLOUD_NAME: string;
  @IsString()
  CLOUDINARY_API_KEY: string;
  @IsString()
  CLOUDINARY_API_SECRET: string;

  @IsString()
  AZURE_STORAGE_CONNECTION: string;

  @IsString()
  AZURE_STORAGE_PDF_CONTAINER: string;

  @IsString()
  REDIS_PASSWORD: string;
  @IsString()
  REDIS_HOST: string;
  @IsString()
  REDIS_PORT: string;

  @IsString()
  MAIL_HOST: string;
  @Type(() => Number)
  @IsNumber()
  MAIL_PORT: number;
  @IsString()
  MAIL_USER: string;
  @IsString()
  MAIL_PASSWORD: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
