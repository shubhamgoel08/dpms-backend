import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../../../admin/application/services/AdminService';
import { DoctorService } from '../../../doctor/application/services/DoctorService';
import { LoginDto } from '../dtos/LoginDto';
import { UserRoleEnum } from '../../domain/enums/UserRoleEnum';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRoleEnum;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: UserRoleEnum;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly adminService: AdminService,
    private readonly doctorService: DoctorService,
  ) {}

  async adminLogin(loginDto: LoginDto): Promise<LoginResponse> {
    const admin = await this.adminService.findByEmail(loginDto.email);

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      admin.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: admin.id,
      email: admin.email,
      role: UserRoleEnum.ADMIN,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: UserRoleEnum.ADMIN,
      },
    };
  }

  async doctorLogin(loginDto: LoginDto): Promise<LoginResponse> {
    const doctor = await this.doctorService.findByEmail(loginDto.email);

    if (!doctor) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      doctor.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: doctor.id,
      email: doctor.email,
      role: UserRoleEnum.DOCTOR,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: doctor.id,
        email: doctor.email,
        name: doctor.name,
        role: UserRoleEnum.DOCTOR,
      },
    };
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    if (payload.role === UserRoleEnum.ADMIN) {
      return await this.adminService.findById(payload.sub);
    } else if (payload.role === UserRoleEnum.DOCTOR) {
      return await this.doctorService.findById(payload.sub);
    }
    return null;
  }
}
