import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ClsService } from 'nestjs-cls';
import { ROLE } from 'src/constants/user';
import { Nutritionist } from 'src/models/nutritionist.model';
import { Person } from 'src/models/person.model';
import { AppStore } from 'src/types/services';
import { AppointmentsService } from '../appointments/appointments.service';
import { AuthService } from '../auth/auth.service';
import { RegisterNutritionistDto } from './validators/register-nutritionist.dto';
import { PatientService } from '../patient/patient.service';
import { UserService } from '../user/user.service';
import { CreateAppointmentDto } from './validators/create-appointment.dto';
import { FindOptions, Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreateGuidanceDto } from './validators/create-guidance.dto';
import { GuidanceService } from '../guidance/guidance.service';
import { User } from 'src/models/user.model';
import { CreateDailyFoodConsumptionDto } from './validators/create-daily-food-consumption.dto';
import { UpdateDailyFoodConsumptionDto } from './validators/update-daily-food-consumption';
import { FoodConsumptionService } from '../food-consumption/food-consumption.service';
import { NutritionalDataService } from '../nutritional-data/nutritional-data.service';
import { endOfDay, startOfDay } from 'date-fns';
import { CheckFirstAccessDto } from './validators/check-first-access.dto';
import { FirstAccessSetupDto } from './validators/first-access-setup.dto';
import { PaginatedResponse } from '../common/response/paginated.response';
import { Appointment } from 'src/models/appointment.model';
import { GetNextNutritionistAppointments } from './validators/get-next-nutritionist-appointments.dto';

@Injectable()
export class NutritionistService {
  constructor(
    @InjectModel(Nutritionist) private nutritionistModel: typeof Nutritionist,
    private patientService: PatientService,
    private appointmentsService: AppointmentsService,
    private authService: AuthService,
    private userService: UserService,
    private readonly clsService: ClsService<AppStore>,
    private readonly sequelize: Sequelize,
    private readonly guidanceService: GuidanceService,
    private readonly foodConsumptionService: FoodConsumptionService,
    private readonly nutritionalDataService: NutritionalDataService,
  ) {}

  async create({ crn, ...data }: RegisterNutritionistDto) {
    const transaction = await this.sequelize.transaction();

    try {
      const nutritionistRole = ROLE.NUTRITIONIST;

      const alreadyExistsCrn = await this.nutritionistModel.findOne({
        where: { crn },
      });

      if (alreadyExistsCrn) {
        throw new BadRequestException('CRN já cadastrado.');
      }

      const newUser = await this.userService.create(
        {
          ...data,
          role: nutritionistRole,
        },
        transaction,
      );

      const nutritionist = await this.nutritionistModel.create(
        {
          personId: newUser.personId,
          crn,
        },
        { include: Person, transaction },
      );

      const payload = {
        nutritionist: nutritionist.toJSON(),
      };

      transaction.commit();

      return payload;
    } catch (err) {
      transaction.rollback();
      throw err;
    }
  }

  async getById(
    id: string,
    options: Omit<FindOptions<Nutritionist>, 'where'> = {},
  ) {
    const nutritionist = await this.nutritionistModel.findOne({
      where: { id },
      ...options,
    });

    if (!nutritionist) {
      throw new NotFoundException('Nutricionista não encontrado');
    }

    return nutritionist.toJSON();
  }

  async getByPersonId(
    personId: string,
    options: Omit<FindOptions<Nutritionist>, 'where'> = {},
  ) {
    const nutritionist = await this.nutritionistModel.findOne({
      where: { personId },
      ...options,
    });

    if (!nutritionist) {
      throw new NotFoundException('Nutricionista não encontrado');
    }

    return nutritionist.toJSON();
  }

  async createAppointment(
    nutritionistId: string,
    { appointmentDate, notificationTimes, patientId }: CreateAppointmentDto,
  ) {
    const { user } = this.clsService.get();

    const nutritionist = await this.getById(nutritionistId, {
      include: { model: Person, include: [User] },
    });

    if (nutritionist.person.user.id !== user.id) {
      throw new BadRequestException('Nutricionista inválido');
    }

    const patient = await this.patientService.getById(patientId, {
      include: Person,
    });

    const patientUser = await this.userService.getByPersonId(patient.personId);

    const userIds = [user.id, patientUser.id];

    const appointment = await this.appointmentsService.create({
      appointmentDate,
      minutesBeforeToNotice: notificationTimes,
      patientId: patient.id,
      nutritionistId: nutritionist.id,
      userIds,
      patientName: patient.person.name,
      nutritionistName: nutritionist.person.name,
      emails: [user.email, patientUser.email],
    });

    return appointment;
  }

  async createGuidance(
    nutritionistId: string,
    { nutritionalGuidance, patientId }: CreateGuidanceDto,
  ) {
    const { user } = this.clsService.get();

    const nutritionist = await this.getById(nutritionistId, {
      include: { model: Person, include: [User] },
    });

    if (nutritionist.person.user.id !== user.id) {
      throw new BadRequestException('Nutricionista inválido');
    }

    const patient = await this.patientService.getById(patientId, {
      include: { model: Person, include: [User] },
    });

    const guidance = await this.guidanceService.create({
      nutritionalGuidance,
      patientId: patient.id,
      nutritionistId,
      patientUserId: patient.person.user.id,
    });

    return guidance;
  }

  async createDailyFoodConsumption(
    patientId: string,
    data: CreateDailyFoodConsumptionDto,
  ) {
    const { user } = this.clsService.get();

    const patient = await this.getById(patientId);

    const nutritionist = await this.getByPersonId(user.personId);

    return this.foodConsumptionService.create(
      patient.id,
      nutritionist.id,
      data,
    );
  }

  async updateDailyFoodConsumption(
    patientId: string,
    foodConsumptionId: string,
    data: UpdateDailyFoodConsumptionDto,
  ) {
    const patient = await this.getById(patientId);

    return this.foodConsumptionService.update(
      patient.id,
      foodConsumptionId,
      data,
    );
  }

  private isSameNutritionistAsUser(nutritionist: Nutritionist) {
    const { user } = this.clsService.get();

    if (user.role === ROLE.PATIENT && nutritionist.personId !== user.personId) {
      return false;
    }

    return true;
  }

  async createNutritionalData({
    patientId,
    nutritionistId,
    ...data
  }: {
    patientId: string;
    nutritionistId: string;
    description: string;
    file: Express.Multer.File;
  }) {
    const patient = await this.patientService.getById(patientId);

    const nutritionist = await this.getById(nutritionistId);

    if (!this.isSameNutritionistAsUser(nutritionist)) {
      throw new UnauthorizedException('Acesso não autorizado');
    }

    return this.nutritionalDataService.create({
      ...data,
      nutritionistId: nutritionist.id,
      patientId: patient.id,
    });
  }

  async checkFirstAccess({ birthdayDate, crn, name }: CheckFirstAccessDto) {
    const birthdayRange: [Date, Date] = [
      startOfDay(birthdayDate),
      endOfDay(birthdayDate),
    ];

    const nutritionist = await this.nutritionistModel.findOne({
      where: {
        crn: crn,
        '$person.birthdayDate$': {
          [Op.between]: birthdayRange,
        },
        '$person.name$': {
          [Op.iLike]: `%${name}%`,
        },
      },
      include: {
        model: Person,
        required: true,
      },
    });

    if (!nutritionist) {
      throw new NotFoundException('Nutritionista não encontrado');
    }

    const user = await this.userService.getByPersonId(nutritionist.personId);

    if (user.email || user.password) {
      throw new BadRequestException('Usuário já tem dados de login!');
    }

    return nutritionist;
  }

  async firstAccessSetup(data: FirstAccessSetupDto) {
    const { email, password, ...checkData } = data;

    const nutritionist = await this.checkFirstAccess(checkData);

    const setupUser = await this.userService.setupLoginData(
      nutritionist.personId,
      {
        email,
        password,
      },
    );

    const token = await this.authService.signPayload({ email, password });

    return {
      token,
      user: setupUser,
    };
  }

  async getNextAppointments(
    nutritionistId: string,
    query: GetNextNutritionistAppointments,
  ): Promise<PaginatedResponse<Appointment[]>> {
    const nutritionist = await this.getById(nutritionistId);

    return this.appointmentsService.getNextAppointmentsByNutritionistId(
      nutritionist.id,
      query,
    );
  }
}
