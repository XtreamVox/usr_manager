import nodemailer from "nodemailer";
import env from "./env.js";

export const transporter = nodemailer.createTransport({
  service: "gmail", // o SMTP personalizado
  auth: {
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
  },
});
