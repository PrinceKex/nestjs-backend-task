import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from './models/user';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginBiometricsDto } from './dto/login.biometrics.dto';
import { DataInterceptor } from '../common/interceptors/data.interceptors';
import { JwtAuthGuard } from './jwt-auth.guard';

@UseInterceptors(DataInterceptor)
@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  async show() {
    return 'This will be updated to return all users';
  }

  @Mutation(() => User)
  async register(@Args('input') input: RegisterDto): Promise<User> {
    return this.authService.register(input);
  }

  @Mutation(() => User)
  async login(@Args('input') input: LoginDto) {
    return this.authService.login(input);
  }

  @Mutation(() => User)
  async loginWithBiometrics(@Args('input') input: LoginBiometricsDto) {
    return this.authService.loginWithBiometrics(input);
  }
}
