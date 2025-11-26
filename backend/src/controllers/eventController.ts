import { Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { eventService } from '../services/eventService';
import { ticketService } from '../services/ticketService';
import { paymentService } from '../services/paymentService';
import { AuthRequest } from '../middleware/auth';

export const eventController = {
  createEvent: asyncHandler(async (req: AuthRequest, res: Response) => {
    const event = await eventService.createEvent(req.body);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  }),

  getEvents: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { isActive, upcoming } = req.query;

    const filters: any = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (upcoming !== undefined) filters.upcoming = upcoming === 'true';

    const events = await eventService.getEvents(filters);

    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  }),

  getEvent: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { eventId } = req.params;

    const event = await eventService.getEvent(eventId);

    res.json({
      success: true,
      data: event,
    });
  }),

  updateEvent: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { eventId } = req.params;

    const event = await eventService.updateEvent(eventId, req.body);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: event,
    });
  }),

  deleteEvent: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { eventId } = req.params;

    const result = await eventService.deleteEvent(eventId);

    res.json({
      success: true,
      message: result.message,
    });
  }),

  checkout: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { eventId } = req.params;
    const { buyerName, buyerEmail, buyerPhone } = req.body;
    const userId = req.user?.userId; // Optional - for logged-in users

    // Get event details
    const event = await eventService.getEvent(eventId);

    // Create ticket
    const ticket = await ticketService.createTicket({
      eventId,
      buyerName,
      buyerEmail,
      buyerPhone,
      userId,
    });

    // Initialize payment
    const payment = await paymentService.initializePayment({
      email: buyerEmail,
      amount: event.price,
      ticketId: ticket.id,
      metadata: {
        buyerName,
        buyerPhone,
        eventTitle: event.title,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Checkout initiated. Please complete payment.',
      data: {
        ticket: {
          id: ticket.id,
          code: ticket.ticketCode,
        },
        payment: {
          authorizationUrl: payment.authorizationUrl,
          reference: payment.reference,
        },
      },
    });
  }),

  getEventTickets: asyncHandler(async (req: AuthRequest, res: Response) => {
    const { eventId } = req.params;

    const tickets = await eventService.getEventTickets(eventId);

    res.json({
      success: true,
      data: tickets,
      count: tickets.length,
    });
  }),
};
