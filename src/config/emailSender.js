import nodemailer from "nodemailer";
import env from "./env.js";

export const transporter = nodemailer.createTransport({
  service: "gmail", // o SMTP personalizado
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});