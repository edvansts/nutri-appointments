import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/modules/common/validators/pagination.dto';

export class GetPatientsListDto extends PaginationDto {
  @IsString()
  @IsOptional()
  patientName: string;
}
