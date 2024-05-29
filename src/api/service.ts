import config from '../config/config';
import prisma from '../loaders/db-connecion';
import { BareResponse, ResponseWithData } from '../types/api';
import {
  CreateDoctorDto,
  CreateUserDataDto,
  CreateUserDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  VerifyResetOtpDto,
} from '../types/dto/auth.dto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import generateOTP from '../utils/generatePassword';
import sendEmail from '../utils/helpers/sendEmail';
import { formatAccountCreationEmailMsg } from '../utils/helpers/string';

class ApiService {
  static async CreateDoctor(createDoctorDto: CreateDoctorDto): Promise<ResponseWithData> {
    const { first_name, last_name, email, password } = createDoctorDto;

    if (!first_name || !last_name || !email || !password) {
      return {
        data: null,
        status: 'fail',
        message: 'Please provide all required fields',
      };
    }

    const adminExists = await prisma.doctor.findUnique({
      where: {
        email,
      },
    });
    if (adminExists) {
      return {
        data: null,
        status: 'fail',
        message: 'Admin already exists',
      };
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const doctor = await prisma.doctor.create({
        data: {
          first_name,
          last_name,
          email,
          password: hashedPassword,
        },
      });

      const { status, message, data } = await this.createOTP({ email });
      if (status == 'success')
        await sendEmail(email as string, 'Doctor Account Created', formatAccountCreationEmailMsg(data as string));

      return {
        status: 'success',
        message: 'Admin created Successfully',
        data: { first_name, last_name, email, id: doctor.id },
      };
    } catch (error) {
      return {
        data: null,
        status: 'fail',
        message: (error as Error).message,
      };
    }
  }
  static async loginAsDoctor(signInDto: SignInDto): Promise<ResponseWithData> {
    const { email, password } = signInDto;

    if (!email || !password) {
      return {
        data: null,
        status: 'fail',
        message: 'Please provide all required fields',
      };
    }

    try {
      const doctor = await prisma.doctor.findUnique({
        where: {
          email,
        },
      });

      if (!doctor) {
        return {
          status: 'fail',
          message: 'Email or password is incorrect',
          data: null,
        };
      }

      const isPasswordCorrect = await bcrypt.compare(password, doctor.password);

      if (!isPasswordCorrect) {
        return {
          status: 'fail',
          message: 'Email or password is incorrect',
          data: null,
        };
      }

      if (!doctor.isVerified) {
        return {
          status: 'fail',
          message: 'Please verify your account first',
          data: null,
        };
      }

      // create a token
      const token = await jwt.sign({ id: doctor.id, role: 'DOCTOR' }, config.jwt.secret as string, {
        expiresIn: config.jwt.expires_in,
      });

      return {
        status: 'success',
        message: 'Admin logged in',
        data: {
          user: { id: doctor.id, first_name: doctor.first_name, last_name: doctor.last_name, email: doctor.email },
          token,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: 'fail',
        message: (error as Error).message,
        data: null,
      };
    }
  }
  static async loginAsUser(controller_id: string): Promise<ResponseWithData> {
    if (!controller_id) {
      return {
        data: null,
        status: 'fail',
        message: 'Please provide  controller id fields',
      };
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          controller_id,
        },
        include: {
          user_data: {
            take: 5,
            orderBy: { recorded_at: 'desc' },
          },
        },
      });

      if (!user) {
        return {
          status: 'fail',
          message: 'User not found with the controller id ',
          data: null,
        };
      }

      // create a token
      const token = await jwt.sign({ id: user.id, role: 'USER' }, config.jwt.secret as string, {
        expiresIn: config.jwt.expires_in,
      });

      return {
        status: 'success',
        message: 'Admin logged in',
        data: {
          user: user,
          token,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        status: 'fail',
        message: (error as Error).message,
        data: null,
      };
    }
  }

  static async createOTP(forgotPasswordDto: ForgotPasswordDto): Promise<ResponseWithData> {
    const { email } = forgotPasswordDto;

    if (!email) {
      return {
        status: 'fail',
        message: 'Please provide all required fields',
        data: null,
      };
    }

    try {
      const doctor = await prisma.doctor.findUnique({
        where: {
          email,
        },
      });

      if (!doctor) {
        return {
          status: 'fail',
          message: 'doctor not found',
          data: null,
        };
      }

      const otp = generateOTP();
      const hashedOTP = await bcrypt.hash(otp, 10);

      await prisma.otp.upsert({
        where: {
          doctor_id: doctor.id,
        },
        update: {
          otp: hashedOTP,
          otp_expires: new Date(Date.now() + 600000), // 10 minutes
        },
        create: {
          doctor_id: doctor.id,
          otp: hashedOTP,
          otp_expires: new Date(Date.now() + 600000), // 10 minutes
        },
      });

      // send email

      return {
        status: 'success',
        message: 'OTP sent to your email',
        data: otp,
      };
    } catch (error) {
      return {
        status: 'fail',
        message: (error as Error).message as string,
        data: null,
      };
    }
  }
  static async veriyAccount({ email, otp }: VerifyResetOtpDto): Promise<BareResponse> {
    try {
      const { status, message } = await this.verifyOtp({ email, otp });

      if (status == 'fail')
        return {
          status: status,
          message: message,
        };

      await prisma.doctor.update({ where: { email }, data: { isVerified: true } });
      return {
        status: 'success',
        message: 'doctor account verified',
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: error.message,
      };
    }
  }
  static async verifyOtp({ email, otp }: VerifyResetOtpDto): Promise<BareResponse> {
    try {
      const otpInfo = await prisma.otp.findFirst({
        where: {
          doctor: {
            email,
          },
        },
      });

      if (!otpInfo) {
        return {
          status: 'fail',
          message: 'OTP not found',
        };
      }

      if (new Date() > otpInfo.otp_expires) {
        return {
          status: 'fail',
          message: 'OTP has expired. Please request a new one',
        };
      }

      const isOtpValid = await bcrypt.compare(otp, otpInfo.otp);
      if (!isOtpValid) {
        return {
          status: 'fail',
          message: 'Invalid OTP',
        };
      }

      await prisma.otp.update({
        where: {
          id: otpInfo.id,
        },
        data: {
          isVerified: true,
        },
      });

      return {
        status: 'success',
        message: 'OTP verified',
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: error.message,
      };
    }
  }
  static async resetPassword({ email, password, confirmPassword }: ResetPasswordDto): Promise<BareResponse> {
    if (password !== confirmPassword) {
      return {
        status: 'fail',
        message: 'Passwords do not match',
      };
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const admin = await prisma.doctor.findUnique({
        where: { email },
      });

      if (!admin) {
        return {
          status: 'fail',
          message: 'Admin not found',
        };
      }

      await prisma.doctor.update({
        where: { email },
        data: { password: hashedPassword },
      });

      // Delete the OTP
      await prisma.otp.deleteMany({
        where: { doctor_id: admin.id },
      });

      return {
        status: 'success',
        message: 'Password reset successful. Please login',
      };
    } catch (error: any) {
      return {
        status: 'fail',
        message: error.message,
      };
    }
  }

  static async CreateUser(createUserDto: CreateUserDto): Promise<ResponseWithData> {
    const { first_name, last_name, controller_id, doctor_id } = createUserDto;

    if (!first_name || !last_name || !controller_id) {
      return {
        data: null,
        status: 'fail',
        message: 'Please provide all required fields',
      };
    }

    const userExists = await prisma.user.findUnique({
      where: {
        controller_id,
      },
    });
    if (userExists) {
      return {
        data: null,
        status: 'fail',
        message: 'Controller is reserved already exists',
      };
    }

    try {
      const user = await prisma.user.create({
        data: {
          first_name,
          last_name,
          controller_id,
          doctor_id,
        },
      });

      return {
        status: 'success',
        message: 'User created successfully',
        data: { first_name, last_name, controller_id, id: user.id },
      };
    } catch (error) {
      return {
        data: null,
        status: 'fail',
        message: (error as Error).message,
      };
    }
  }
  static async CreateUserData(createUserDataDto: CreateUserDataDto): Promise<ResponseWithData> {
    const { body_temperature, heart_rate, accelerometer_x, accelerometer_y, accelerometer_z, controller_id } =
      createUserDataDto;

    if (
      !body_temperature ||
      !heart_rate ||
      !accelerometer_x ||
      !accelerometer_y ||
      !accelerometer_z ||
      !controller_id
    ) {
      return {
        data: null,
        status: 'fail',
        message: 'Please provide all required fields',
      };
    }

    const userExists = await prisma.user.findUnique({
      where: {
        controller_id,
      },
    });
    if (!userExists) {
      return {
        data: null,
        status: 'fail',
        message: 'User not found',
      };
    }

    try {
      const userData = await prisma.userData.create({
        data: {
          body_temperature,
          heart_rate,
          accelerometer_x,
          accelerometer_y,
          accelerometer_z,
          controller_id,
        },
      });

      return {
        status: 'success',
        message: 'User data created successfully',
        data: userData,
      };
    } catch (error) {
      return {
        data: null,
        status: 'fail',
        message: (error as Error).message,
      };
    }
  }

  static async GetDoctorUsers(doctor_id: string): Promise<ResponseWithData> {
    if (!doctor_id) {
      return {
        data: null,
        status: 'fail',
        message: 'Doctor ID is required',
      };
    }

    try {
      const doctor = await prisma.doctor.findUnique({
        where: {
          id: doctor_id,
        },
        include: {
          users: true,
        },
      });

      if (!doctor) {
        return {
          data: null,
          status: 'fail',
          message: 'Doctor not found',
        };
      }

      return {
        status: 'success',
        message: 'Doctor users retrieved successfully',
        data: doctor.users,
      };
    } catch (error) {
      return {
        data: null,
        status: 'fail',
        message: (error as Error).message,
      };
    }
  }

  static async GetUserData(user_id: string): Promise<ResponseWithData> {
    if (!user_id) {
      return {
        data: null,
        status: 'fail',
        message: 'User ID is required',
      };
    }

    try {
      const user = await prisma.user.findUnique({
        where: {
          id: user_id,
        },
        include: {
          user_data: {
            orderBy: {
              recorded_at: 'desc',
            },
          },
        },
      });

      if (!user) {
        return {
          data: null,
          status: 'fail',
          message: 'User not found',
        };
      }

      return {
        status: 'success',
        message: 'User data retrieved successfully',
        data: user.user_data,
      };
    } catch (error) {
      return {
        data: null,
        status: 'fail',
        message: (error as Error).message,
      };
    }
  }
}

export default ApiService;
