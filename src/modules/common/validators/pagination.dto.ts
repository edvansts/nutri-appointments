import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationDto {
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  offset = 0;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  limit = 30;
}
