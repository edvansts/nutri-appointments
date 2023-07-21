import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { compare } from 'bcrypt';
import { isObject } from 'class-validator';
import { ClsService } from 'nestjs-cls';
import { Op, Transaction } from 'sequelize';
import { Person } from 'src/models/person.model';
import { PushInfo } from 'src/models/push-info.model';
import { User } from 'src/models/user.model';
import { AppStore } from 'src/types/services';
import { isValidCPF } from 'src/utils/validation';
import { CheckInDto } from '../auth/validators/check-in.dto';
import { PersonService } from '../person/person.service';
import { CreateUserDto } from './validators/create-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(PushInfo)
    private pushInfoModel: typeof PushInfo,
    private personService: PersonService,
    private readonly cls: ClsService<AppStore>,
  ) {}

  async findByLogin(userData: { email: string; password: string }) {
    const { email, password } = userData;

    const user = await this.userModel.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException('Usuário não existe');
    }

    const isPasswordCorrectly = await compare(password, user.password);

    if (!isPasswordCorrectly) {
      throw new BadRequestException('Senha incorreta');
    }

    return this.normalizeUser(user);
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ where: { email } });

    if (!user) {
      return null;
    }

    return this.normalizeUser(user);
  }

  async findById(id: string, options: { includePerson?: boolean } = {}) {
    const { includePerson } = options;

    const user = await this.userModel.findOne({
      where: { id },
      include: includePerson ? [{ model: Person }] : undefined,
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.normalizeUser(user);
  }

  async findBy(
    { cpf, email }: { email?: string; cpf?: string },
    includePerson = false,
  ) {
    const user = await this.userModel.findOne({
      where: { email, ...(includePerson ? { '$person.cpf$': cpf } : {}) },
      include: includePerson ? [Person] : undefined,
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.normalizeUser(user);
  }

  private normalizeUser(user: User) {
    const jsonUser = user.toJSON();

    delete jsonUser.password;

    return jsonUser;
  }

  async create(
    { cpf, name, role, isCreator = false, birthdayDate }: CreateUserDto,
    transaction?: Transaction,
  ) {
    try {
      const alreadyCreatedPerson = await this.personService.findByCpf(cpf);

      const alreadyCreatedUser = await this.userModel.findOne({
        where: {
          [Op.or]: { personId: alreadyCreatedPerson?.id || null },
        },
      });

      if (isObject(alreadyCreatedUser)) {
        throw new Error('CPF inválido');
      }

      if (!isValidCPF(cpf)) {
        throw new Error('CPF inválido');
      }

      const newPerson =
        alreadyCreatedPerson ||
        (await this.personService.create(
          { cpf, name, birthdayDate },
          transaction,
        ));

      const newUser = await this.userModel.create(
        {
          role,
          personId: newPerson.id,
          isCreator,
        },
        { transaction },
      );

      return newUser;
    } catch (error) {
      throw new BadRequestException(Error(error).message);
    }
  }

  private async getPushInfosById(...ids: string[]) {
    const pushInfos = await this.pushInfoModel.findAll({
      where: { id: { [Op.in]: ids } },
    });

    return pushInfos;
  }

  private async getPushInfosByPersonIds(...personIds: string[]) {
    const pushInfos = await this.pushInfoModel.findAll({
      where: { '$user.personId$': { [Op.in]: personIds } },
      include: { model: User },
    });

    return pushInfos;
  }

  async getByPersonId(personId: string) {
    const user = this.userModel.findOne({ where: { personId } });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async checkIn({ pushToken }: CheckInDto) {
    try {
      const { user } = this.cls.get();

      const pushInfos = await this.getPushInfosById(user.id);

      const existsPushInfo = pushInfos.find(({ token }) => token === pushToken);

      if (existsPushInfo) {
        existsPushInfo.update({ lastCheckInAt: new Date() });
        return;
      }

      await this.pushInfoModel.create({
        token: pushToken,
        userId: user.id,
      });
    } catch (err) {
      this.logger.error(err);
    }
  }

  async getPushTokensById(...userIds: string[]) {
    const pushInfos = await this.getPushInfosById(...userIds);

    const tokens = pushInfos.map(({ token }) => token);

    return tokens;
  }

  async getPushTokensByPersonId(...personIds: string[]) {
    const pushInfos = await this.getPushInfosByPersonIds(...personIds);

    const tokens = pushInfos.map(({ token }) => token);

    return tokens;
  }

  async setPassword(email: string, newPassword: string) {
    const user = await this.userModel.findOne({ where: { email } });

    user.password = newPassword;

    await user.save();

    return this.normalizeUser(user);
  }

  async setupLoginData(
    personId: string,
    { email, password }: { password: string; email: string },
  ) {
    const alreadyExistingUser = await this.findByEmail(email);

    if (alreadyExistingUser) {
      throw new BadRequestException(
        'Email já utilizado, por favor insira outro',
      );
    }

    const user = await this.getByPersonId(personId);

    user.password = password;
    user.email = email;

    await user.save();

    return this.normalizeUser(user);
  }
}
