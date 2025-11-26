import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { paymentService } from '../services/paymentService';
import { AuthRequest } from '../middleware/auth';

export const paymentController = {
  verifyPayment: asyncHandler(async (req: Request, res: Response) => {
    const { reference } = req.params;

    const result = await paymentService.verifyPayment(reference);

    res.json({
      success: true,
      data: result,
    });
  }),

  handleWebhook: asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['x-paystack-signature'] as string;

    await paymentService.handleWebhook(req.body, signature);

    res.status(200).json({
      success: true,
      message: 'Webhook processed',
    });
  }),

  getPaymentLogs: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, ticketId, startDate, endDate } = req.query;

    const filters: any = {};
    if (status) filters.status = status;
    if (ticketId) filters.ticketId = ticketId;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const payments = await paymentService.getPaymentLogs(filters);

    res.json({
      success: true,
      data: payments,
      count: payments.length,
    });
  }),

  getPaymentLog: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paymentId } = req.params;

    const payment = await paymentService.getPaymentLog(paymentId);

    res.json({
      success: true,
      data: payment,
    });
  }),

  initiateRefund: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reference } = req.params;
    const { amount } = req.body;

    const result = await paymentService.initiateRefund(reference, amount);

    res.json({
      success: true,
      message: 'Refund initiated successfully',
      data: result,
    });
  }),
};
