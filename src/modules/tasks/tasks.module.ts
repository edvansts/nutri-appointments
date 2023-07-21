import { Module } from '@nestjs/common';
import { NotificationModule } from '../notification/notification.module';
import { PatientModule } from '../patient/patient.module';
import { TasksService } from './tasks.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  providers: [TasksService],
  imports: [NotificationModule, PatientModule, AuthModule],
})
export class TasksModule {}
