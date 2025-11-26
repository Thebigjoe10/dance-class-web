import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import {
  generateTicketCode,
  generateQRPayload,
  generateQRCodeImage,
  verifyQRPayload,
} from '../utils/qrcode';
import { sendTicketEmail } from '../utils/email';
import { eventService } from './eventService';

export const ticketService = {
  async createTicket(data: {
    eventId: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    userId?: string;
  }) {
    // Check event availability
    const isAvailable = await eventService.checkAvailability(data.eventId);
    if (!isAvailable) {
      throw new AppError('Event is sold out', 400);
    }

    // Generate ticket code and QR payload
    const ticketCode = generateTicketCode();

    // Create ticket first to get ID
    const ticket = await prisma.ticket.create({
      data: {
        eventId: data.eventId,
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerPhone: data.buyerPhone,
        userId: data.userId,
        ticketCode,
        qrPayload: 'placeholder', // Will update after
        status: 'PENDING',
      },
      include: {
        event: true,
      },
    });

    // Generate QR payload with ticket ID
    const qrPayload = generateQRPayload(ticket.id, ticketCode);
    const qrImageUrl = await generateQRCodeImage(qrPayload);

    // Update ticket with QR data
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        qrPayload,
        qrImageUrl,
      },
      include: {
        event: true,
      },
    });

    return updatedTicket;
  },

  async confirmTicket(ticketId: string) {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'CONFIRMED',
        issuedAt: new Date(),
      },
      include: {
        event: true,
      },
    });

    // Send ticket email
    try {
      await sendTicketEmail(ticket.buyerEmail, {
        eventTitle: ticket.event.title,
        eventDate: ticket.event.date.toLocaleDateString(),
        eventTime: ticket.event.time,
        eventVenue: ticket.event.venue,
        ticketCode: ticket.ticketCode,
        buyerName: ticket.buyerName,
        qrImageUrl: ticket.qrImageUrl || '',
        ticketId: ticket.id,
      });
    } catch (error) {
      console.error('Failed to send ticket email:', error);
      // Don't fail the confirmation if email fails
    }

    return ticket;
  },

  async getTicket(ticketId: string, includeEvent: boolean = true) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: includeEvent,
        paymentLog: true,
        user: includeEvent
          ? {
              select: {
                id: true,
                name: true,
                email: true,
              },
            }
          : false,
      },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    return ticket;
  },

  async getTicketByCode(ticketCode: string) {
    const ticket = await prisma.ticket.findUnique({
      where: { ticketCode },
      include: {
        event: true,
        paymentLog: true,
      },
    });

    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    return ticket;
  },

  async getUserTickets(userId: string) {
    const tickets = await prisma.ticket.findMany({
      where: { userId },
      include: {
        event: true,
        paymentLog: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tickets;
  },

  async getTicketsByEmail(email: string) {
    const tickets = await prisma.ticket.findMany({
      where: { buyerEmail: email },
      include: {
        event: true,
        paymentLog: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tickets;
  },

  async verifyTicket(qrPayload: string) {
    // Verify QR payload signature and format
    const verification = verifyQRPayload(qrPayload);

    if (!verification.valid) {
      return {
        valid: false,
        error: verification.error,
      };
    }

    // Find ticket in database
    const ticket = await prisma.ticket.findUnique({
      where: { qrPayload },
      include: {
        event: true,
      },
    });

    if (!ticket) {
      return {
        valid: false,
        error: 'Ticket not found in system',
      };
    }

    // Check ticket status
    if (ticket.status === 'CANCELLED') {
      return {
        valid: false,
        error: 'Ticket has been cancelled',
      };
    }

    if (ticket.status === 'USED') {
      return {
        valid: false,
        error: 'Ticket has already been used',
        usedAt: ticket.usedAt,
      };
    }

    if (ticket.status !== 'CONFIRMED') {
      return {
        valid: false,
        error: 'Ticket payment not confirmed',
      };
    }

    // Check if event has passed
    const eventDate = new Date(ticket.event.date);
    const now = new Date();
    if (eventDate < now) {
      // Allow same day entry
      const isSameDay =
        eventDate.toDateString() === now.toDateString();

      if (!isSameDay) {
        return {
          valid: false,
          error: 'Event has passed',
        };
      }
    }

    return {
      valid: true,
      ticket: {
        id: ticket.id,
        code: ticket.ticketCode,
        buyerName: ticket.buyerName,
        event: {
          title: ticket.event.title,
          date: ticket.event.date,
          time: ticket.event.time,
          venue: ticket.event.venue,
        },
      },
    };
  },

  async markTicketAsUsed(ticketId: string) {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'USED',
        usedAt: new Date(),
      },
      include: {
        event: true,
      },
    });

    return ticket;
  },

  async cancelTicket(ticketId: string) {
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'CANCELLED',
      },
    });

    return ticket;
  },

  async linkTicketsToUser(email: string, userId: string) {
    // Find all tickets with this email that don't have a user
    const tickets = await prisma.ticket.updateMany({
      where: {
        buyerEmail: email,
        userId: null,
      },
      data: {
        userId,
      },
    });

    return {
      message: `Successfully linked ${tickets.count} tickets to user account`,
      count: tickets.count,
    };
  },
};
