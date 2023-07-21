import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SequelizeModule } from '@nestjs/sequelize';
import { ForgottenPassword } from 'src/models/forgottenPassword.model';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.USER_AUTH_SECRET,
        signOptions: {
          expiresIn: '90 days',
        },
      }),
    }),
    UserModule,
    SequelizeModule.forFeature([ForgottenPassword]),
  ],
  exports: [AuthService],
})
export class AuthModule {}
