import { registerAs } from '@nestjs/config';

export default registerAs('googleOAuth', () => ({
  clinetID: process.env.GOOGLE_CLIENT_ID || "539478373835-jsnsji4cmdu3pimj568rkg2q03gpdstb.apps.googleusercontent.com",
  clientSecret: process.env.GOOGLE_SECRET || "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" ,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/v1/auth/google/callback",
}));
