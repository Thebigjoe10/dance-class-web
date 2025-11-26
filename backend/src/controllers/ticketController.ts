import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ticketService } from '../services/ticketService';
import { AuthRequest } from '../middleware/auth';

export const ticketController = {
  getTicket: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { ticketId } = req.params;

    const ticket = await ticketService.getTicket(ticketId);

    res.json({
      success: true,
      data: ticket,
    });
  }),

  getMyTickets: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;

    const tickets = await ticketService.getUserTickets(userId);

    res.json({
      success: true,
      data: tickets,
      count: tickets.length,
    });
  }),

  getTicketsByEmail: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email } = req.query;

    const tickets = await ticketService.getTicketsByEmail(email as string);

    res.json({
      success: true,
      data: tickets,
      count: tickets.length,
    });
  }),

  verifyTicket: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { qrPayload } = req.body;

    const result = await ticketService.verifyTicket(qrPayload);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.error,
        valid: false,
      });
    }

    res.json({
      success: true,
      message: 'Ticket is valid',
      valid: true,
      data: result.ticket,
    });
  }),

  markTicketAsUsed: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { ticketId } = req.params;

    const ticket = await ticketService.markTicketAsUsed(ticketId);

    res.json({
      success: true,
      message: 'Ticket marked as used',
      data: ticket,
    });
  }),

  cancelTicket: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { ticketId } = req.params;

    const ticket = await ticketService.cancelTicket(ticketId);

    res.json({
      success: true,
      message: 'Ticket cancelled successfully',
      data: ticket,
    });
  }),

  linkTicketsToUser: asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { email } = req.body;

    const result = await ticketService.linkTicketsToUser(email, userId);

    res.json({
      success: true,
      message: result.message,
      data: { count: result.count },
    });
  }),
};
