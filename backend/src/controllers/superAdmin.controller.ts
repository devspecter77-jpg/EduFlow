import type { Request, Response } from 'express';
import * as svc from '@/services/superAdmin.service';
import { generateAccessToken } from '@/utils/jwt';
import { auditLogRepository } from '@/repositories/auditLog.repository';

interface ImpersonationTarget {
  id: string;
  phone: string;
  role: string;
  fullName: string;
  centerName: string;
  centerId?: string | null;
}

export class SuperAdminController {
  /**
   * Shared by impersonateUser/impersonate: mints an impersonation-flagged
   * access token (imp + impersonatedBy claims) and records the action in
   * the audit log, under the initiating Super Admin's own userId.
   */
  private issueImpersonationToken(target: ImpersonationTarget, req: Request): string {
    const impersonatedBy = req.user!.userId;

    const token = generateAccessToken({
      userId: target.id,
      email: target.phone,
      role: target.role,
      centerId: target.centerId || undefined,
      imp: true,
      impersonatedBy,
    });

    // Fire-and-forget, matching the existing audit-logging convention
    // (e.g. auth.controller.ts login) — an audit-log failure must not
    // block the impersonation flow itself.
    auditLogRepository.create({
      userId: impersonatedBy,
      action: 'LOGIN',
      entity: 'User',
      entityId: target.id,
      description: `Super Admin ${target.fullName} (${target.centerName}) hisobiga kirdi`,
      metadata: {
        type: 'IMPERSONATION',
        impersonatedUserId: target.id,
        impersonatedUserRole: target.role,
        impersonatedCenterId: target.centerId ?? null,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    }).catch(() => {});

    return token;
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  async getStats(_req: Request, res: Response): Promise<void> {
    const data = await svc.getSuperAdminStats();
    res.json({ success: true, data });
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async listUsers(req: Request, res: Response): Promise<void> {
    const { page, limit, role, isActive, search } = req.query;
    const result = await svc.listUsers({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      role: role as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      search: search as string,
    });
    res.json({ success: true, ...result });
  }

  async blockUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await svc.blockUser(String(id));
    res.json({ success: true, message: 'Foydalanuvchi bloklandi' });
  }

  async unblockUser(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await svc.unblockUser(String(id));
    res.json({ success: true, message: 'Foydalanuvchi faollashtirildi' });
  }

  async impersonateUser(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const user = await svc.getUserById(String(userId));
    if (!user) { res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi yoki faol emas' }); return; }

    const token = this.issueImpersonationToken(user, req);
    res.json({
      success: true,
      data: { token, user },
      message: `${user.centerName} ga kirmoqdasiz`,
    });
  }

  // ── Centers ───────────────────────────────────────────────────────────────

  async listCenters(req: Request, res: Response): Promise<void> {
    const { page, limit, status, search } = req.query;
    const result = await svc.listCenters({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status: status as string,
      search: search as string,
    });
    res.json({ success: true, ...result });
  }

  async getCenter(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const center = await svc.getCenterById(String(id));
    if (!center) { res.status(404).json({ success: false, message: 'Center topilmadi' }); return; }
    res.json({ success: true, data: center });
  }

  async getCenterStats(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const stats = await svc.getCenterStats(String(id));
    res.json({ success: true, data: stats });
  }

  async createCenter(req: Request, res: Response): Promise<void> {
    const { name, phone, email, address, adminFullName, adminPhone, adminPassword, planType } = req.body;
    if (!name || !adminFullName || !adminPhone || !adminPassword) {
      res.status(400).json({ success: false, message: 'name, adminFullName, adminPhone, adminPassword talab qilinadi' });
      return;
    }
    const result = await svc.createCenter({ name, phone, email, address, adminFullName, adminPhone, adminPassword, planType });
    res.status(201).json({ success: true, data: result, message: 'Center va admin muvaffaqiyatli yaratildi' });
  }

  async updateCenter(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await svc.updateCenter(String(id), req.body);
    res.json({ success: true, data: result, message: 'Center yangilandi' });
  }

  async deleteCenter(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await svc.deleteCenter(String(id));
    res.json({ success: true, message: "Center o'chirildi" });
  }

  async blockCenter(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await svc.blockCenter(String(id));
    res.json({ success: true, message: 'Center bloklandi' });
  }

  async unblockCenter(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    await svc.unblockCenter(String(id));
    res.json({ success: true, message: 'Center faollashtirildi' });
  }

  // ── Plans ─────────────────────────────────────────────────────────────────

  async listPlans(_req: Request, res: Response): Promise<void> {
    const data = await svc.listPlans();
    res.json({ success: true, data });
  }

  async updatePlan(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await svc.updatePlan(String(id), req.body);
    res.json({ success: true, data: result, message: 'Plan yangilandi' });
  }

  // ── Subscriptions ─────────────────────────────────────────────────────────

  async extendSubscription(req: Request, res: Response): Promise<void> {
    const { centerId, planId, months, price } = req.body;
    if (!centerId || !planId || !months) {
      res.status(400).json({ success: false, message: 'centerId, planId, months talab qilinadi' });
      return;
    }
    const result = await svc.extendSubscription(centerId, planId, Number(months), Number(price) || 0);
    res.status(201).json({ success: true, data: result, message: 'Subscription uzaytirildi' });
  }

  async updateSubscription(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const result = await svc.updateSubscription(String(id), req.body);
    res.json({ success: true, data: result, message: 'Subscription yangilandi' });
  }

  // ── Impersonate ───────────────────────────────────────────────────────────

  async impersonate(req: Request, res: Response): Promise<void> {
    const { centerId } = req.params;
    const admin = await svc.getImpersonateToken(String(centerId));

    const token = this.issueImpersonationToken(admin, req);
    res.json({
      success: true,
      data: { token, user: admin },
      message: `${admin.centerName} ga kirmoqdasiz`,
    });
  }
}

export const superAdminController = new SuperAdminController();
