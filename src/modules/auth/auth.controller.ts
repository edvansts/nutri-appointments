import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from 'src/config/decorators/is-public.decorator';
import { JwtAuthGuard } from 'src/config/guards/jwt-auth.guard';
import { RolesGuard } from 'src/config/guards/roles.guard';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './responses/login-response.dto';
import { CheckInDto } from './validators/check-in.dto';
import { LoginDto } from './validators/login.dto';
import { ForgotPasswordDto } from './validators/forgot-password.dto';
import { ResetPasswordDto } from './validators/reset-password.dto';
import { User } from 'src/models/user.model';

@ApiTags('auth')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOkResponse({ type: LoginResponseDto })
  @Public()
  async login(@Body() userDto: LoginDto) {
    return this.authService.login(userDto);
  }

  @Post('check-in')
  @ApiBearerAuth()
  @ApiNoContentResponse()
  async checkIn(@Body() data: CheckInDto) {
    return this.authService.checkIn(data);
  }

  @Post('forgot-password')
  @Public()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Get('check-verification-code/:verificationCode')
  @Public()
  async checkForgotPasswordCode(
    @Param('verificationCode') verificationCode: string,
  ) {
    return this.authService.checkForgotPasswordCode(verificationCode);
  }

  @Post('reset-password')
  @Public()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Get('user-info')
  @ApiBearerAuth()
  @ApiResponse({ type: User })
  async getUserInfo() {
    return this.authService.getUserInfo();
  }
}
