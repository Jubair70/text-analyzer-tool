import { registerAs } from '@nestjs/config';

export default registerAs('googleOAuth', () => ({
  clinetID: process.env.GOOGLE_CLIENT_ID ,
  clientSecret: process.env.GOOGLE_SECRET ,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/v1/auth/google/callback",
}));
