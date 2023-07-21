import { IsEnum } from 'class-validator';
import { PaginationDto } from 'src/modules/common/validators/pagination.dto';

export enum APPOINTMENT_QUERY_TYPE {
  SCHEDULED = 'SCHEDULED',
  CANCELED = 'CANCELED',
  FINISHED = 'FINISHED',
}

export class GetNextNutritionistAppointments extends PaginationDto {
  @IsEnum(APPOINTMENT_QUERY_TYPE)
  type: APPOINTMENT_QUERY_TYPE;
}
