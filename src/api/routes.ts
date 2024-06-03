import express from 'express';
import {
  CreateDoctor,
  CreateUser,
  CreateUserData,
  GetDoctorUsers,
  GetUserData,
  forgotPassword,
  loginAsDoctor,
  loginAsUser,
  resetPassword,
  verifyAccount,
  verifyOtp,
} from './controller';
import { authGuard, roleGuard } from '../middleware/auth';
const router = express.Router();

router.use(authGuard);

// post routes
router.post('/doctor/create-user', roleGuard('DOCTOR'), CreateUser); // Create a user
router.post('/user/add-data', CreateUserData); // Create user data

// Doctor routes
router.get('/doctor/user-data/:controller_id', GetUserData); // Get users associated with a doctor by doctor ID
router.get('/doctor/users/:doctor_id', roleGuard('DOCTOR'), GetDoctorUsers); // Get users associated with a doctor by doctor ID

// admin auth routes
router.post('/auth/doctor/login', loginAsDoctor);
router.post('/auth/user/login', loginAsUser);
router.post('/auth/create-doctor', CreateDoctor);

router.post('/auth/verify-account', verifyAccount);
router.post('/auth/forgot', forgotPassword);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/reset', resetPassword);

export default router;
