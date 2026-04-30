import nodemailer from "nodemailer";
import env from "./env.js";

export const transporter = nodemailer.createTransport({
  service: "gmail", // o SMTP personalizado
  auth: {
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  },
});
