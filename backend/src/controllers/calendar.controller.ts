import type { Request, Response } from 'express';
import { calendarRepository } from '@/repositories/calendar.repository';
import type { EventType } from '@/repositories/calendar.repository';

export class CalendarController {
  async getAll(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { type, startDate, endDate, groupId, studentId } = req.query;

    const filters = {
      userId,
      ...(type && { type: type as EventType }),
      ...(startDate && { startDate: new Date(startDate as string) }),
      ...(endDate && { endDate: new Date(endDate as string) }),
      ...(groupId && { groupId: groupId as string }),
      ...(studentId && { studentId: studentId as string }),
    };

    const events = await calendarRepository.getAll(filters);
    res.json({ success: true, data: events });
  }

  async getToday(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const events = await calendarRepository.getToday(userId);
    res.json({ success: true, data: events });
  }

  async getUpcoming(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
    const events = await calendarRepository.getUpcoming(userId, days);
    res.json({ success: true, data: events });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const userId = req.user!.userId;
    const event = await calendarRepository.getById(id, userId);

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.json({ success: true, data: event });
  }

  async create(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const { type, title, description, startDate, endDate, allDay, color, location, groupId, studentId, isRecurring, recurringRule } = req.body;

    if (!type || !title || !startDate || !endDate) {
      res.status(400).json({ success: false, message: 'Type, title, startDate, and endDate are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    if (start > end) {
      res.status(400).json({ success: false, message: 'Start date must be before end date' });
      return;
    }

    const event = await calendarRepository.create({
      userId, type, title, description,
      startDate: start, endDate: end,
      allDay, color, location, groupId, studentId, isRecurring, recurringRule,
    });

    res.status(201).json({ success: true, data: event, message: 'Event created successfully' });
  }

  async update(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const userId = req.user!.userId;
    const updateData = { ...req.body };

    if (updateData.startDate && updateData.endDate) {
      const start = new Date(updateData.startDate as string);
      const end = new Date(updateData.endDate as string);
      if (start > end) {
        res.status(400).json({ success: false, message: 'Start date must be before end date' });
        return;
      }
      updateData.startDate = start;
      updateData.endDate = end;
    }

    const event = await calendarRepository.update(id, userId, updateData);
    res.json({ success: true, data: event, message: 'Event updated successfully' });
  }

  async deleteEvent(req: Request, res: Response): Promise<void> {
    const id = String(req.params.id);
    const userId = req.user!.userId;
    await calendarRepository.delete(id, userId);
    res.json({ success: true, message: 'Event deleted successfully' });
  }
}

export const calendarController = new CalendarController();
