import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

export const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const verificationUrl = `${config.frontend.url}/verify/${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - Dance School',
    html: `
      <h1>Welcome to Dance School!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    `,
    text: `Welcome to Dance School! Verify your email: ${verificationUrl}`,
  });
};

export const sendTicketEmail = async (
  email: string,
  ticketDetails: {
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventVenue: string;
    ticketCode: string;
    buyerName: string;
    qrImageUrl: string;
    ticketId: string;
  }
): Promise<void> => {
  const ticketUrl = `${config.frontend.url}/tickets/${ticketDetails.ticketId}`;

  await sendEmail({
    to: email,
    subject: `Your Ticket for ${ticketDetails.eventTitle}`,
    html: `
      <h1>Your Ticket Confirmation</h1>
      <p>Dear ${ticketDetails.buyerName},</p>
      <p>Thank you for your purchase! Here are your ticket details:</p>

      <div style="border: 2px solid #333; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <h2>${ticketDetails.eventTitle}</h2>
        <p><strong>Date:</strong> ${ticketDetails.eventDate}</p>
        <p><strong>Time:</strong> ${ticketDetails.eventTime}</p>
        <p><strong>Venue:</strong> ${ticketDetails.eventVenue}</p>
        <p><strong>Ticket Code:</strong> ${ticketDetails.ticketCode}</p>

        <div style="text-align: center; margin: 20px 0;">
          <img src="${ticketDetails.qrImageUrl}" alt="Ticket QR Code" style="max-width: 300px;"/>
        </div>

        <p style="text-align: center;">
          <a href="${ticketUrl}" style="background: #333; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Download Ticket
          </a>
        </p>
      </div>

      <p><strong>Important:</strong> Please present this QR code at the event entrance.</p>
      <p>See you at the event!</p>
    `,
    text: `
      Your Ticket Confirmation

      Dear ${ticketDetails.buyerName},

      Event: ${ticketDetails.eventTitle}
      Date: ${ticketDetails.eventDate}
      Time: ${ticketDetails.eventTime}
      Venue: ${ticketDetails.eventVenue}
      Ticket Code: ${ticketDetails.ticketCode}

      Download your ticket: ${ticketUrl}
    `,
  });
};

export const sendClassReminderEmail = async (
  email: string,
  details: {
    studentName: string;
    className: string;
    classDate: string;
    classTime: string;
    instructor: string;
  }
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: `Class Reminder: ${details.className}`,
    html: `
      <h1>Class Reminder</h1>
      <p>Dear ${details.studentName},</p>
      <p>This is a reminder about your upcoming class:</p>

      <div style="border-left: 4px solid #333; padding-left: 20px; margin: 20px 0;">
        <h2>${details.className}</h2>
        <p><strong>Date:</strong> ${details.classDate}</p>
        <p><strong>Time:</strong> ${details.classTime}</p>
        <p><strong>Instructor:</strong> ${details.instructor}</p>
      </div>

      <p>We look forward to seeing you!</p>
    `,
    text: `
      Class Reminder

      Dear ${details.studentName},

      Class: ${details.className}
      Date: ${details.classDate}
      Time: ${details.classTime}
      Instructor: ${details.instructor}

      We look forward to seeing you!
    `,
  });
};

export const sendPaymentConfirmationEmail = async (
  email: string,
  details: {
    buyerName: string;
    amount: number;
    reference: string;
    eventTitle: string;
  }
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: 'Payment Confirmation - Dance School',
    html: `
      <h1>Payment Received</h1>
      <p>Dear ${details.buyerName},</p>
      <p>We have successfully received your payment.</p>

      <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p><strong>Amount:</strong> ₦${details.amount.toLocaleString()}</p>
        <p><strong>Reference:</strong> ${details.reference}</p>
        <p><strong>Event:</strong> ${details.eventTitle}</p>
      </div>

      <p>Your ticket will be sent in a separate email.</p>
      <p>Thank you for your purchase!</p>
    `,
  });
};
