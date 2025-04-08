import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from './models/user';
import { Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginBiometricsDto } from './dto/login.biometrics.dto';
import { DataInterceptor } from 'src/common/interceptors/data.interceptors';
import { JwtAuthGuard } from './jwt-auth.guard';

@UseInterceptors(DataInterceptor)
@Resolver((of) => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Query((returns) => User)
  async show() {
    return 'This will be updated to return all users';
  }

  @Mutation((returns) => User)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Mutation((returns) => Boolean)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.register(loginDto);
  }

  @Mutation((returns) => Boolean)
  async loginWithBiometrics(
    @Args('biometricsInfo') biometricsInfo: LoginBiometricsDto,
  ) {
    return this.authService.loginWithBiometrics(biometricsInfo);
  }
}
