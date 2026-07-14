import { Router } from 'express';
import { calendarController } from '@/controllers/calendar.controller';
import { asyncHandler } from '@/middleware';

const router = Router();

// Get all events
router.get('/events', asyncHandler((req, res) => calendarController.getAll(req, res)));

// Get today's events (must be before /:id)
router.get('/events/today', asyncHandler((req, res) => calendarController.getToday(req, res)));

// Get upcoming events (must be before /:id)
router.get('/events/upcoming', asyncHandler((req, res) => calendarController.getUpcoming(req, res)));

// Get event by ID
router.get('/events/:id', asyncHandler((req, res) => calendarController.getById(req, res)));

// Create event
router.post('/events', asyncHandler((req, res) => calendarController.create(req, res)));

// Update event
router.patch('/events/:id', asyncHandler((req, res) => calendarController.update(req, res)));

// Delete event
router.delete('/events/:id', asyncHandler((req, res) => calendarController.deleteEvent(req, res)));

export default router;
