import { Request, Response } from 'express';
import config from '../config/config';
import ApiService from './service';
import sendEmail from '../utils/helpers/sendEmail';
import { formatAccountCreationEmailMsg, formatResetOptEmailMsg } from '../utils/helpers/string';

// express function to handle the request

export async function CreateDoctor(req: Request, res: Response) {
  try {
    console.log(req.body);
    const { first_name, last_name, email, password } = req.body;
    const { status, message, data } = await ApiService.CreateDoctor({
      first_name,
      last_name,
      email,
      password,
    });

    if (status == 'fail') {
      return res.status(400).json({
        status,
        message,
        data: null,
      });
    }

    return res.status(200).json({
      status,
      message,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: (error as Error).message,
      data: null,
    });
  }
}

export async function loginAsDoctor(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const { status, message, data } = await ApiService.loginAsDoctor({ email, password });
    if (status == 'fail') {
      return res.status(400).json({
        status,
        message,
        data: null,
      });
    }

    return res.status(200).json({
      status,
      message,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: (error as Error).message,
      data: null,
    });
  }
}
export async function loginAsUser(req: Request, res: Response) {
  try {
    const { controller_id } = req.body;
    const { status, message, data } = await ApiService.loginAsUser(controller_id);
    if (status == 'fail') {
      return res.status(400).json({
        status,
        message,
        data: null,
      });
    }

    return res.status(200).json({
      status,
      message,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: (error as Error).message,
      data: null,
    });
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    const { status, message, data: otp } = await ApiService.createOTP({ email });
    if (status == 'fail') {
      return res.status(400).json({
        status,
        message,
      });
    }

    await sendEmail(email, 'Reset your password', formatResetOptEmailMsg(otp as string));

    return res.status(200).json({
      status,
      message,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: (error as Error).message,
    });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide all required fields',
    });
  }

  try {
    const { status, message } = await ApiService.verifyOtp({ email, otp });

    if (status === 'fail') {
      return res.status(400).json({
        status,
        message,
      });
    }

    return res.status(200).json({
      status,
      message,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: (error as Error).message,
    });
  }
}
export async function verifyAccount(req: Request, res: Response) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please provide all required fields',
    });
  }

  try {
    const { status, message } = await ApiService.veriyAccount({ email, otp });

    if (status === 'fail') {
      return res.status(400).json({
        status,
        message,
      });
    }

    return res.status(200).json({
      status,
      message,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: (error as Error).message,
    });
  }
}
export async function resetPassword(req: Request, res: Response) {
  const { email, password, confirmPassword } = req.body;

  try {
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide all required fields',
      });
    }

    const { status, message } = await ApiService.resetPassword({ email, password, confirmPassword });

    if (status === 'fail') {
      return res.status(400).json({
        status,
        message,
      });
    }

    return res.status(200).json({
      status,
      message,
    });
  } catch (error: any) {
    return res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
}

export async function CreateUser(req: any, res: Response) {
  try {
    console.log(req.user);
    const { first_name, last_name, controller_id } = req.body;
    const { status, message, data } = await ApiService.CreateUser({
      first_name,
      last_name,
      controller_id,
      doctor_id: req?.user?.id,
    });

    if (status == 'fail') {
      return res.status(400).json({
        status,
        message,
        data: null,
      });
    }

    return res.status(200).json({
      status,
      message,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: (error as Error).message,
      data: null,
    });
  }
}

export async function CreateUserData(req: Request, res: Response) {
  try {
    const { body_temperature, heart_rate, accelerometer_x, accelerometer_y, accelerometer_z, controller_id } = req.body;
    const { status, message, data } = await ApiService.CreateUserData({
      body_temperature,
      heart_rate,
      accelerometer_x,
      accelerometer_y,
      accelerometer_z,
      controller_id,
    });

    if (status == 'fail') {
      return res.status(400).json({
        status,
        message,
        data: null,
      });
    }

    return res.status(200).json({
      status,
      message,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: (error as Error).message,
      data: null,
    });
  }
}

export async function GetUserData(req: Request, res: Response) {
  try {
    const { user_id } = req.params;
    const { status, message, data } = await ApiService.GetUserData(user_id);

    if (status == 'fail') {
      return res.status(404).json({
        status,
        message,
        data: null,
      });
    }

    return res.status(200).json({
      status,
      message,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: (error as Error).message,
      data: null,
    });
  }
}

export async function GetDoctorUsers(req: Request, res: Response) {
  try {
    const { doctor_id } = req.params;
    const { status, message, data } = await ApiService.GetDoctorUsers(doctor_id);

    if (status == 'fail') {
      return res.status(404).json({
        status,
        message,
        data: null,
      });
    }

    return res.status(200).json({
      status,
      message,
      data,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: (error as Error).message,
      data: null,
    });
  }
}
