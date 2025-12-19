import {IsEmail, IsNotEmpty, IsString, MinLength} from 'class-validator'
import {ApiProperty} from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({example: 'patient@example.com', description: 'Patient email address'})
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({example: 'Password123!', description: 'Password', minLength: 8})
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string
}
