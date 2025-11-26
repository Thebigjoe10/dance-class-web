import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const eventService = {
  async createEvent(data: {
    title: string;
    description?: string;
    date: string;
    time: string;
    venue: string;
    capacity: number;
    price: number;
    imageUrl?: string;
  }) {
    const event = await prisma.event.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });

    return event;
  },

  async getEvents(filters?: { isActive?: boolean; upcoming?: boolean }) {
    const where: any = {};

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.upcoming) {
      where.date = {
        gte: new Date(),
      };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        _count: {
          select: {
            tickets: {
              where: {
                status: { in: ['CONFIRMED', 'PENDING'] },
              },
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return events.map((event) => ({
      ...event,
      soldTickets: event._count.tickets,
      availableTickets: event.capacity - event._count.tickets,
    }));
  },

  async getEvent(eventId: string) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            tickets: {
              where: {
                status: { in: ['CONFIRMED', 'PENDING'] },
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    return {
      ...event,
      soldTickets: event._count.tickets,
      availableTickets: event.capacity - event._count.tickets,
    };
  },

  async updateEvent(
    eventId: string,
    data: Partial<{
      title: string;
      description: string;
      date: string;
      time: string;
      venue: string;
      capacity: number;
      price: number;
      imageUrl: string;
      isActive: boolean;
    }>
  ) {
    const updateData: any = { ...data };

    if (data.date) {
      updateData.date = new Date(data.date);
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: updateData,
    });

    return event;
  },

  async deleteEvent(eventId: string) {
    // Check if there are any confirmed tickets
    const ticketCount = await prisma.ticket.count({
      where: {
        eventId,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });

    if (ticketCount > 0) {
      throw new AppError(
        'Cannot delete event with confirmed tickets. Cancel tickets first.',
        400
      );
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return { message: 'Event deleted successfully' };
  },

  async getEventTickets(eventId: string) {
    const tickets = await prisma.ticket.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        paymentLog: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tickets;
  },

  async checkAvailability(eventId: string): Promise<boolean> {
    const event = await this.getEvent(eventId);
    return event.availableTickets > 0;
  },
};
