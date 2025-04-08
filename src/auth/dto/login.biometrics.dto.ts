import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class LoginBiometricsDto {
  @Field()
  @IsString()
  @MinLength(6, { message: 'Biometric key must be at least 6 characters long' })
  biometricKey: string;
}
