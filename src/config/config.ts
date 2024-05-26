import dotenv from 'dotenv';
dotenv.config();

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwt: {
    secret: process.env.JWT_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
  },

  email_host: process.env.EMAIL_HOST,
  email_port: process.env.EMAIL_PORT,
  email: process.env.EMAIL,
  email_password: process.env.EMAIL_PASSWORD,

  super_admin_email: process.env.SUPER_ADMIN_EMAIL,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  super_admin_firstname: process.env.SUPER_ADMIN_FIRST_NAME,
  super_admin_lastname: process.env.SUPER_ADMIN_LAST_NAME,

  number_of_result: process.env.NUMBER_OF_RESULTS,
};
