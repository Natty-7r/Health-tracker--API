import { count } from 'console';

export default function generateOTP(digits: number = 6) {
  // Generate a random otp of specified length
  const otp = Math.random().toString().slice(-digits);
  return otp;
}
