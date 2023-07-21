import { CacheModule, Module } from '@nestjs/common';
import type { ClientOpts } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { validateEnv } from './config/env/validate';
import { AuthModule } from './modules/auth/auth.module';
import { AnthropometricEvaluation } from './models/anthropometric-evaluation.model';
import { Appointment } from './models/appointment.model';
import { BiochemicalEvaluation } from './models/biochemical-evaluation.model';
import { ClinicalEvaluation } from './models/clinical-evaluation.model';
import { Diagnostic } from './models/diagnostic.model';
import { Guidance } from './models/guidance.model';
import { Nutritionist } from './models/nutritionist.model';
import { Patient } from './models/patient.model';
import { Person } from './models/person.model';
import { PhysicalEvaluation } from './models/physical-evaluation.model';
import { User } from './models/user.model';
import { PatientModule } from './modules/patient/patient.module';
import { NutritionistModule } from './modules/nutritionist/nutritionist.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './modules/tasks/tasks.module';
import { Notification } from './models/notification.model';
import { PushInfo } from './models/push-info.model';
import { ClsModule } from 'nestjs-cls';
import { FoodConsumption } from './models/food-consumption.model';
import { FoodRecord } from './models/food-record.model';
import { BodyEvolution } from './models/body-evolution.model';
import { NutritionalData } from './models/nutritional-data.model';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ForgottenPassword } from './models/forgottenPassword.model';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: [`${process.cwd()}/.env.${process.env.NODE_ENV}`, '.env'],
      isGlobal: true,
      validate: validateEnv,
    }),
    CacheModule.register<ClientOpts>({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      ttl: 60 * 3,
      isGlobal: true,
    }),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        setup: (cls) => {
          cls.set('user', undefined);
        },
      },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        secure: false,
        port: Number(process.env.MAIL_PORT),
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
        ignoreTLS: true,
      },
      template: {
        dir: join(__dirname, '..', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
      defaults: {
        // configurações que podem ser padrões
        from: '"NutriConsultas+" <nutri.consultas.max@gmail.com>',
      },
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: process.env.NODE_ENV === 'production',
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialectOptions:
        process.env.NODE_ENV === 'production'
          ? {
              ssl: {
                require: true,
                rejectUnauthorized: false,
              },
            }
          : {},
      models: [
        Person,
        User,
        Nutritionist,
        Patient,
        Diagnostic,
        Appointment,
        Guidance,
        PhysicalEvaluation,
        BiochemicalEvaluation,
        AnthropometricEvaluation,
        ClinicalEvaluation,
        Notification,
        PushInfo,
        FoodConsumption,
        FoodRecord,
        BodyEvolution,
        NutritionalData,
        ForgottenPassword,
      ],
      autoLoadModels: true,
      synchronize: true,
    }),
    AuthModule,
    PatientModule,
    NutritionistModule,
    TasksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
