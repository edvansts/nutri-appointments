import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/config/decorators/is-public.decorator';
import { Roles } from 'src/config/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/config/guards/jwt-auth.guard';
import { RolesGuard } from 'src/config/guards/roles.guard';
import { ROLE } from 'src/constants/user';
import { RegisterNutritionistDto } from './validators/register-nutritionist.dto';
import { NutritionistService } from './nutritionist.service';
import { CreateAppointmentDto } from './validators/create-appointment.dto';
import { CreateNutritionistResponse } from './response/create-nutritionist.response';
import { Appointment } from 'src/models/appointment.model';
import { Guidance } from 'src/models/guidance.model';
import { CreateGuidanceDto } from './validators/create-guidance.dto';
import { FoodConsumption } from 'src/models/food-consumption.model';
import { CreateDailyFoodConsumptionDto } from './validators/create-daily-food-consumption.dto';
import { UpdateDailyFoodConsumptionDto } from './validators/update-daily-food-consumption';
import { FileInterceptor } from '@nestjs/platform-express';
import { NutritionalData } from 'src/models/nutritional-data.model';
import { toMb } from 'src/utils/transform';
import { PDF_EXTENSION_REGEX } from 'src/constants/regex';
import { CreateNutritionalDataDto } from './validators/create-nutritional-data.dto';
import { CreatorsGuard } from 'src/config/guards/creators.guard';
import { CheckFirstAccessDto } from './validators/check-first-access.dto';
import { NoCache } from 'src/config/decorators/no-cache.decorator';
import { FirstAccessSetupDto } from './validators/first-access-setup.dto';
import { FirstAccessSetupResponse } from './response/first-access-setup.response';
import { TotalCountInterceptor } from 'src/config/interceptors/total-count.interceptor';
import { TOTAL_COUNT_HEADER_DESCRIPTION } from '../common/constants';
import { GetNextNutritionistAppointments } from './validators/get-next-nutritionist-appointments.dto';

@ApiBearerAuth()
@ApiTags('nutritionist')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@Controller('nutritionist')
export class NutritionistController {
  constructor(private nutritionistService: NutritionistService) {}

  @Get('/person/:personId')
  async getNutritionistByPersonId(@Param('personId') personId: string) {
    return this.nutritionistService.getByPersonId(personId);
  }

  @Roles(ROLE.NUTRITIONIST)
  @Post(':nutritionistId/appointment')
  @ApiCreatedResponse({ type: Appointment })
  async createAppointment(
    @Param('nutritionistId') nutritionistId: string,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.nutritionistService.createAppointment(
      nutritionistId,
      createAppointmentDto,
    );
  }

  @Post()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CreateNutritionistResponse })
  @Public()
  @UseGuards(CreatorsGuard)
  async createNutritionist(@Body() nutritionist: RegisterNutritionistDto) {
    return this.nutritionistService.create(nutritionist);
  }

  @Post('/:nutritionistId/guidance')
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: Guidance })
  @Roles(ROLE.NUTRITIONIST)
  async createGuidance(
    @Param('nutritionistId') nutritionistId: string,
    @Body() guidanceData: CreateGuidanceDto,
  ) {
    return this.nutritionistService.createGuidance(
      nutritionistId,
      guidanceData,
    );
  }

  @Post('/patient/:patientId/food-consumption')
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: FoodConsumption })
  @Roles(ROLE.NUTRITIONIST)
  async createFoodConsumption(
    @Param('patientId') patientId: string,
    @Body() foodConsumption: CreateDailyFoodConsumptionDto,
  ) {
    return this.nutritionistService.createDailyFoodConsumption(
      patientId,
      foodConsumption,
    );
  }

  @Put('/patient/:patientId/food-consumption/:foodConsumptionId')
  @ApiBearerAuth()
  @ApiOkResponse({ type: FoodConsumption })
  @Roles(ROLE.NUTRITIONIST)
  async updateFoodConsumption(
    @Param('patientId') patientId: string,
    @Param('foodConsumptionId') foodConsumptionId: string,
    @Body() foodConsumption: UpdateDailyFoodConsumptionDto,
  ) {
    return this.nutritionistService.updateDailyFoodConsumption(
      patientId,
      foodConsumptionId,
      foodConsumption,
    );
  }

  @Post(':nutritionistId/patient/:patientId/nutritional-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiOkResponse({ type: NutritionalData })
  @UsePipes(new ValidationPipe({ transform: true }))
  @Roles(ROLE.NUTRITIONIST)
  async createNutritionalData(
    @Param('nutritionistId') nutritionistId: string,
    @Param('patientId') patientId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: toMb(10) }),
          new FileTypeValidator({
            fileType: PDF_EXTENSION_REGEX,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query() data: CreateNutritionalDataDto,
  ) {
    return this.nutritionistService.createNutritionalData({
      file,
      nutritionistId,
      patientId,
      ...data,
    });
  }

  @Post('check-first-access')
  @Public()
  @NoCache()
  async checkFirstAccess(@Body() checkFirstAccessDto: CheckFirstAccessDto) {
    return this.nutritionistService.checkFirstAccess(checkFirstAccessDto);
  }

  @Post('first-access-setup')
  @Public()
  @NoCache()
  @ApiOkResponse({ type: FirstAccessSetupResponse })
  async firstAccessSetup(@Body() firstAccessSetupDto: FirstAccessSetupDto) {
    return this.nutritionistService.firstAccessSetup(firstAccessSetupDto);
  }

  @Get(':nutritionistId/next-appointments')
  @ApiBearerAuth()
  @UseInterceptors(TotalCountInterceptor)
  @ApiQuery({ type: GetNextNutritionistAppointments })
  @ApiHeader(TOTAL_COUNT_HEADER_DESCRIPTION)
  @ApiOkResponse({ type: [Appointment] })
  @UsePipes(new ValidationPipe({ transform: true }))
  @Roles(ROLE.NUTRITIONIST)
  async getNextAppointments(
    @Param('nutritionistId') nutritionistId: string,
    @Query() pagination: GetNextNutritionistAppointments,
  ) {
    return this.nutritionistService.getNextAppointments(
      nutritionistId,
      pagination,
    );
  }
}
