import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { isEmpty } from 'class-validator';
import { NotificationService } from '../notification/notification.service';
import { PatientService } from '../patient/patient.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly patientService: PatientService,
    private readonly authService: AuthService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkScheduledNotifications() {
    try {
      this.logger.log('Verificating scheduled notifications');

      await this.notificationService.checkNotifications();
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(
          `Verificating schedule notifications cron error: ${err.message}`,
          err.stack,
        );
      } else {
        this.logger.error(err);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async rememberSendBodyEvolution() {
    try {
      this.logger.log(
        'Verificating patients without send body evolution in last 30 days',
      );

      const patients =
        await this.patientService.getPatientsWithoutBodyEvolutionLastThirtyDays();

      if (isEmpty(patients)) {
        return;
      }

      const personIds = patients.map(({ personId }) => personId);

      await this.notificationService.notifyUsersAboutFoodConsumptionRegister(
        personIds,
      );
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(
          `Remember to send body evolution cron error: ${err.message}`,
          err.stack,
        );
      } else {
        this.logger.error(err);
      }
    }
  }

  // EVERY MONDAY 2_AM
  @Cron('0 2 * * 0')
  async deleteOldestForgetPasswords() {
    try {
      this.logger.log('Deleting oldest forgot password columns');
      await this.authService.deleteOldestForgottenPasswords();
    } catch (err) {
      if (err instanceof Error) {
        this.logger.error(
          `Deleting forgot password cron error: ${err.message}`,
          err.stack,
        );
      } else {
        this.logger.error(err);
      }
    }
  }
}
