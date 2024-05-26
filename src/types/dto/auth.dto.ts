export interface CreateDoctorDto {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface CreateUserDto {
  first_name: string;
  last_name: string;
  controller_id: string;
  doctor_id: string;
}

export interface CreateUserDataDto {
  body_temperature: number;
  heart_rate: number;
  accelerometer_x: number;
  accelerometer_y: number;
  accelerometer_z: number;
  controller_id: string;
}

export interface SignInDto {
  email: string;
  password: string;
}
export interface ForgotPasswordDto {
  email: string;
}

export type UpdateAdminStatusDto = {
  adminId: string;
  status: 'ACTIVE' | 'INACTIVE';
};

export interface DeleteAdminDto {
  adminId: string;
}

export interface VerifyResetOtpDto {
  email: string;
  otp: string;
}

export interface ResetPasswordDto {
  email: string;
  password: string;
  confirmPassword: string;
}
