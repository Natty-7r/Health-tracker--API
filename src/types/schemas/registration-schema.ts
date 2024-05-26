import z, { ZodError } from 'zod';
import config from '../../config/config';

z.coerce.string().email().min(5);

export const firstNameSchema = z
  .string()
  .regex(/(^[\u1200-\u137F\s]+$)|(^[a-zA-Z]+$)/, { message: 'First name must contain only letters' })
  .min(2, { message: 'First name must be at least 3 characters long' })
  .max(15, { message: 'First name must be at most 15 characters long' });

export const lastNameSchema = z
  .string()
  .regex(/(^[\u1200-\u137F\s]+$)|(^[a-zA-Z]+$)/, { message: 'First name must contain only letters' })
  .min(2, { message: 'First name must be at least 3 characters long' })
  .max(15, { message: 'First name must be at most 15 characters long' });

export const emailSchema = z.string().refine(
  (value) => {
    // Check if the email is valid
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9]*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;

    return emailRegex.test(value);
  },
  {
    message: 'Invalid email address. Please enter a valid email.',
  },
);
