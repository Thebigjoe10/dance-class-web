import axios from 'axios';
import crypto from 'crypto';
import prisma from '../config/database';
import { config } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { ticketService } from './ticketService';
import { sendPaymentConfirmationEmail } from '../utils/email';

const paystackClient = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${config.paystack.secretKey}`,
    'Content-Type': 'application/json',
  },
});

export const paymentService = {
  async initializePayment(data: {
    email: string;
    amount: number;
    ticketId: string;
    metadata?: any;
  }) {
    try {
      // Amount in kobo (Paystack uses kobo, not naira)
      const amountInKobo = Math.round(data.amount * 100);

      const response = await paystackClient.post('/transaction/initialize', {
        email: data.email,
        amount: amountInKobo,
        currency: 'NGN',
        reference: `TKT-${data.ticketId}-${Date.now()}`,
        callback_url: `${config.frontend.url}/payment/callback`,
        metadata: {
          ticketId: data.ticketId,
          ...data.metadata,
        },
      });

      if (!response.data.status) {
        throw new AppError('Failed to initialize payment', 500);
      }

      // Create payment log
      await prisma.paymentLog.create({
        data: {
          ticketId: data.ticketId,
          amount: data.amount,
          reference: response.data.data.reference,
          provider: 'paystack',
          status: 'PENDING',
        },
      });

      return {
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference: response.data.data.reference,
      };
    } catch (error: any) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new AppError('Failed to initialize payment', 500);
    }
  },

  async verifyPayment(reference: string) {
    try {
      const response = await paystackClient.get(`/transaction/verify/${reference}`);

      if (!response.data.status) {
        throw new AppError('Payment verification failed', 400);
      }

      const data = response.data.data;

      return {
        status: data.status, // 'success', 'failed', 'abandoned'
        amount: data.amount / 100, // Convert from kobo to naira
        currency: data.currency,
        reference: data.reference,
        paidAt: data.paid_at,
        channel: data.channel,
        metadata: data.metadata,
      };
    } catch (error: any) {
      console.error('Payment verification error:', error.response?.data || error.message);
      throw new AppError('Failed to verify payment', 500);
    }
  },

  async handleWebhook(payload: any, signature: string) {
    // Verify webhook signature
    if (config.paystack.webhookSecret) {
      const hash = crypto
        .createHmac('sha512', config.paystack.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (hash !== signature) {
        throw new AppError('Invalid webhook signature', 401);
      }
    }

    const event = payload.event;
    const data = payload.data;

    console.log(`Webhook received: ${event}`);

    // Handle different webhook events
    if (event === 'charge.success') {
      await this.handleSuccessfulPayment(data);
    } else if (event === 'charge.failed') {
      await this.handleFailedPayment(data);
    }

    return { message: 'Webhook processed' };
  },

  async handleSuccessfulPayment(data: any) {
    const reference = data.reference;
    const amountInNaira = data.amount / 100;

    // Find payment log
    const paymentLog = await prisma.paymentLog.findUnique({
      where: { reference },
      include: { ticket: { include: { event: true } } },
    });

    if (!paymentLog) {
      console.error(`Payment log not found for reference: ${reference}`);
      return;
    }

    // Update payment log
    await prisma.paymentLog.update({
      where: { id: paymentLog.id },
      data: {
        status: 'SUCCESS',
        paidAt: new Date(data.paid_at),
        channel: data.channel,
        rawPayload: data,
      },
    });

    // Confirm ticket if exists
    if (paymentLog.ticketId) {
      try {
        await ticketService.confirmTicket(paymentLog.ticketId);

        // Send payment confirmation email
        if (paymentLog.ticket) {
          await sendPaymentConfirmationEmail(paymentLog.ticket.buyerEmail, {
            buyerName: paymentLog.ticket.buyerName,
            amount: amountInNaira,
            reference,
            eventTitle: paymentLog.ticket.event.title,
          });
        }
      } catch (error) {
        console.error('Error confirming ticket:', error);
      }
    }
  },

  async handleFailedPayment(data: any) {
    const reference = data.reference;

    // Find payment log
    const paymentLog = await prisma.paymentLog.findUnique({
      where: { reference },
    });

    if (!paymentLog) {
      console.error(`Payment log not found for reference: ${reference}`);
      return;
    }

    // Update payment log
    await prisma.paymentLog.update({
      where: { id: paymentLog.id },
      data: {
        status: 'FAILED',
        rawPayload: data,
      },
    });

    // Cancel ticket if exists
    if (paymentLog.ticketId) {
      try {
        await ticketService.cancelTicket(paymentLog.ticketId);
      } catch (error) {
        console.error('Error cancelling ticket:', error);
      }
    }
  },

  async getPaymentLogs(filters?: {
    status?: string;
    ticketId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.ticketId) where.ticketId = filters.ticketId;

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const payments = await prisma.paymentLog.findMany({
      where,
      include: {
        ticket: {
          include: {
            event: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payments;
  },

  async getPaymentLog(paymentId: string) {
    const payment = await prisma.paymentLog.findUnique({
      where: { id: paymentId },
      include: {
        ticket: {
          include: {
            event: true,
          },
        },
      },
    });

    if (!payment) {
      throw new AppError('Payment log not found', 404);
    }

    return payment;
  },

  async initiateRefund(reference: string, amount?: number) {
    try {
      const payload: any = { transaction: reference };

      if (amount) {
        // Amount in kobo
        payload.amount = Math.round(amount * 100);
      }

      const response = await paystackClient.post('/refund', payload);

      if (!response.data.status) {
        throw new AppError('Failed to initiate refund', 500);
      }

      // Update payment log
      await prisma.paymentLog.update({
        where: { reference },
        data: {
          status: 'REFUNDED',
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Refund error:', error.response?.data || error.message);
      throw new AppError('Failed to initiate refund', 500);
    }
  },
};
