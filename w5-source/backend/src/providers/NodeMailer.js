import nodemailer from 'nodemailer'
import { env } from '~/config/environment'

export const sendEmailService = async (
  recipientEmail,
  customSubject,
  htmlContent
) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: env.EMAIL_USERNAME,
      pass: env.EMAIL_PASSWORD
    }
  })

  const info = await transporter.sendMail({
    from: env.EMAIL_USERNAME,
    to: recipientEmail,
    subject: customSubject,
    html: htmlContent
  })
  return info
}
