import {ApiProperty} from '@nestjs/swagger'

import {PatientResponseDto} from '@modules/patient/application/dtos/PatientResponseDto'

export class AuthResponseDto {
  @ApiProperty({example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'})
  accessToken: string

  @ApiProperty({example: 'Bearer'})
  tokenType: string

  @ApiProperty({example: '1d'})
  expiresIn: string

  @ApiProperty({type: PatientResponseDto})
  user: PatientResponseDto

  static create(
    accessToken: string,
    expiresIn: string,
    user: PatientResponseDto,
  ): AuthResponseDto {
    const dto = new AuthResponseDto()

    dto.accessToken = accessToken
    dto.tokenType = 'Bearer'
    dto.expiresIn = expiresIn
    dto.user = user

    return dto
  }
}
