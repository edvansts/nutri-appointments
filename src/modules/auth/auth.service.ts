import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { subDays, subMinutes } from 'date-fns';
import { Op } from 'sequelize';
import { ForgottenPassword } from 'src/models/forgottenPassword.model';
import { UserService } from '../user/user.service';
import { SignPayload, TokenData } from './types';
import { CheckInDto } from './validators/check-in.dto';
import { LoginDto } from './validators/login.dto';
import { ForgotPasswordDto } from './validators/forgot-password.dto';
import { ResetPasswordDto } from './validators/reset-password.dto';
import { User } from 'src/models/user.model';
import { AppStore } from 'src/types/services';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private readonly mailerService: MailerService,
    @InjectModel(ForgottenPassword)
    private readonly forgottenPasswordModel: typeof ForgottenPassword,
    private readonly clsService: ClsService<AppStore>,
  ) {}

  async signPayload(payload: SignPayload) {
    return this.jwtService.sign(payload);
  }

  async validateUser(payload: LoginDto) {
    return await this.userService.findByLogin(payload);
  }

  async validateTokenData({ email }: TokenData) {
    return await this.userService.findByEmail(email);
  }

  async login(data: LoginDto) {
    const user = await this.userService.findByLogin(data);

    const token = await this.signPayload({
      email: data.email,
      password: data.password,
    });

    return {
      user,
      token,
    };
  }

  async checkIn(data: CheckInDto) {
    return this.userService.checkIn(data);
  }

  async forgotPassword({ cpf, email }: ForgotPasswordDto) {
    const user = await this.userService.findBy({ cpf, email }, true);

    const existsPendingForgottenPassword =
      await this.forgottenPasswordModel.findOne({
        where: {
          userId: user.id,
          createdAt: {
            [Op.between]: [subMinutes(new Date(), 30), new Date()],
          },
        },
        attributes: ['id'],
      });

    if (existsPendingForgottenPassword) {
      throw new InternalServerErrorException(
        'Email de recuperação enviado recentemente, por favor verifique sua caixa de entrada.',
      );
    }

    const newForgottenPassword = await this.forgottenPasswordModel.create({
      code: (Math.floor(Math.random() * 9000000) + 1000000).toString(), //Generate 7 digits number,
      userId: user.id,
    });

    await this.sendResetPasswordEmail({
      code: newForgottenPassword.code,
      name: user.person.name,
      to: user.email,
    });

    return 'Email enviado!';
  }

  private async sendResetPasswordEmail({
    code,
    name,
    to,
  }: {
    to: string;
    code: string;
    name: string;
  }) {
    const email = await this.mailerService.sendMail({
      to,
      from: 'nutri.consultas.max@mail.edvan.tech',
      subject: 'Recupere sua senha - NutriConsultas+',
      template: './reset-password',
      context: {
        code,
        name,
      },
    });

    return email;
  }

  async checkForgotPasswordCode(verificationCode: string) {
    const existsPendingForgottenPassword =
      await this.forgottenPasswordModel.findOne({
        where: {
          code: verificationCode,
          createdAt: {
            [Op.between]: [subMinutes(new Date(), 30), new Date()],
          },
        },
      });

    if (!existsPendingForgottenPassword) {
      throw new BadRequestException('Código de verificação inválido inválido');
    }

    return true;
  }

  async resetPassword({ password, verificationCode }: ResetPasswordDto) {
    const checkForgottenPassword = await this.checkForgotPasswordCode(
      verificationCode,
    );

    if (!checkForgottenPassword) {
    }

    const forgottenPassword = await this.forgottenPasswordModel.findOne({
      where: { code: verificationCode },
      include: { model: User, attributes: ['email'] },
    });

    const newUser = await this.userService.setPassword(
      forgottenPassword.user.email,
      password,
    );

    await forgottenPassword.destroy();

    return newUser;
  }

  async deleteOldestForgottenPasswords() {
    const deletedCount = await this.forgottenPasswordModel.destroy({
      where: {
        createdAt: {
          [Op.lte]: subDays(new Date(), 1),
        },
      },
    });

    return deletedCount;
  }

  async getUserInfo() {
    const { user } = this.clsService.get();

    const userWithPerson = this.userService.findById(user.id, {
      includePerson: true,
    });

    return userWithPerson;
  }
}
