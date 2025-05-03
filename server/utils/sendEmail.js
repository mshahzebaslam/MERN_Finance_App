import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER, // 🔥 Fix case sensitivity
      pass: process.env.APP_PASSWORD,
    }
  });

export const sendReminderEmail = async ({ to, subject, text }) => {
  try {
    await transporter.sendMail({
      from: process.env.USER,
      to,
      subject,
      text,
    });
    console.log('Reminder email sent successfully');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};


