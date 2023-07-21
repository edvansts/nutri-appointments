import { PickType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { BaseAuthDto } from './base-auth.dto';

export class ResetPasswordDto extends PickType(BaseAuthDto, ['password']) {
  @IsString()
  verificationCode: string;
}
