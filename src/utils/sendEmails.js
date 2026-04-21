import { transporter } from "../config/emailSender.js";

export async function sendVerificationEmail(to, code, name) {
  const mailOptions = {
    from: `"Tu App" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Código de verificación",
    html: `
      <h2>Hola ${name}</h2>
      <p>Tu código de verificación es:</p>
      <h1>${code}</h1>
      <p>Este código expira en unos minutos.</p>
    `,
  };

  
  await transporter.sendMail(mailOptions);
}