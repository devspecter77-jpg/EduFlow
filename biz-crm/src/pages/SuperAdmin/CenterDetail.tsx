import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader3D } from '@/components/Loader3D';
import { superAdminApi, type Center, type CenterStats } from '@/lib/api/superAdmin';
import { useToast } from '@/contexts/ToastContext';
import {
  ArrowLeft,
  Building2,
  Users,
  GraduationCap,
  UsersRound,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Lock,
  Unlock,
  LogIn,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
} from 'lucide-react';
import { ExtendSubscriptionModal } from './modals/ExtendSubscriptionModal';
import { EditCenterModal } from './modals/EditCenterModal';

export function CenterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [center, setCenter] = useState<Center | null>(null);
  const [stats, setStats] = useState<CenterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [centerData, statsData] = await Promise.all([
        superAdminApi.getCenter(id),
        superAdminApi.getCenterStats(id),
      ]);
      setCenter(centerData);
      setStats(statsData);
    } catch {
      showToast('error', 'Ma\'lumotlarni yuklashda xatolik');
      navigate('/super-admin/centers');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!id || !center) return;
    if (!confirm('Haqiqatan ham ushbu markazni bloklaysizmi?')) return;
    try {
      await superAdminApi.blockCenter(id);
      showToast('success', 'Markaz bloklandi');
      loadData();
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    }
  };

  const handleUnblock = async () => {
    if (!id || !center) return;
    try {
      await superAdminApi.unblockCenter(id);
      showToast('success', 'Markaz faollashtirildi');
      loadData();
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    }
  };

  const handleImpersonate = async () => {
    if (!id || !center) return;
    try {
      const { token, user } = await superAdminApi.impersonate(id);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      showToast('success', `${center.name} ga kirdingiz`);
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch {
      showToast('error', 'Xatolik yuz berdi');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader3D size="lg" />
      </div>
    );
  }

  if (!center || !stats) return null;

  const subscription = center.subscriptions?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/super-admin/centers')}
            className="rounded-lg p-2 hover:bg-accent"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">{center.name}</h1>
            <p className="text-sm text-muted-foreground">
              Yaratilgan: {new Date(center.createdAt).toLocaleDateString('uz-UZ')}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {center.status === 'ACTIVE' ? (
            <button
              onClick={handleBlock}
              className="flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <Lock className="h-4 w-4" />
              Bloklash
            </button>
          ) : (
            <button
              onClick={handleUnblock}
              className="flex items-center gap-2 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
            >
              <Unlock className="h-4 w-4" />
              Faollashtirish
            </button>
          )}
          <button
            onClick={handleImpersonate}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
          >
            <LogIn className="h-4 w-4" />
            Admin sifatida kirish
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">O'quvchilar</p>
              <p className="mt-2 text-3xl font-bold">{stats.students}</p>
            </div>
            <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-3">
              <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">O'qituvchilar</p>
              <p className="mt-2 text-3xl font-bold">{stats.teachers}</p>
            </div>
            <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-3">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Guruhlar</p>
              <p className="mt-2 text-3xl font-bold">{stats.groups}</p>
            </div>
            <div className="rounded-lg bg-teal-100 dark:bg-teal-900/30 p-3">
              <UsersRound className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jami daromad</p>
              <p className="mt-2 text-2xl font-bold">
                {stats.totalRevenue.toLocaleString('uz-UZ')} so'm
              </p>
            </div>
            <div className="rounded-lg bg-violet-100 dark:bg-violet-900/30 p-3">
              <DollarSign className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Center Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="border-b p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Asosiy ma'lumotlar</h2>
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="rounded-lg p-2 hover:bg-accent"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Markaz nomi</p>
                  <p className="font-medium">{center.name}</p>
                </div>
              </div>

              {center.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{center.phone}</p>
                  </div>
                </div>
              )}

              {center.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{center.email}</p>
                  </div>
                </div>
              )}

              {center.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Manzil</p>
                    <p className="font-medium">{center.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Ro'yxatdan o'tgan</p>
                  <p className="font-medium">
                    {new Date(center.createdAt).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {center.description && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Ta'rif</p>
                  <p className="text-sm">{center.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Users Count */}
          {center._count && (
            <div className="rounded-xl border bg-card shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-orange-100 dark:bg-orange-900/30 p-3">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Foydalanuvchilar</p>
                  <p className="text-2xl font-bold">{center._count.users} ta</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Status & Subscription */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-xl border bg-card shadow-sm p-6">
            <h3 className="font-semibold mb-4">Holati</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                    center.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {center.status === 'ACTIVE' ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {center.status}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          {subscription && (
            <div className="rounded-xl border bg-card shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Obuna</h3>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-semibold text-lg">
                    {subscription.plan?.name || subscription.planId}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span
                    className={`inline-flex items-center gap-1.5 mt-1 rounded-full px-3 py-1 text-xs font-medium ${
                      subscription.status === 'TRIAL'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : subscription.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {subscription.status === 'TRIAL' && <Clock className="h-3 w-3" />}
                    {subscription.status === 'ACTIVE' && <CheckCircle className="h-3 w-3" />}
                    {subscription.status === 'EXPIRED' && <XCircle className="h-3 w-3" />}
                    {subscription.status}
                  </span>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Boshlanish</span>
                    <span className="font-medium">
                      {new Date(subscription.startDate).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tugash</span>
                    <span className="font-medium">
                      {new Date(subscription.endDate).toLocaleDateString('uz-UZ')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Narx</span>
                    <span className="font-semibold text-teal-600 dark:text-teal-400">
                      {subscription.price.toLocaleString('uz-UZ')} so'm
                    </span>
                  </div>
                </div>

                {subscription.notes && (
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">Izoh:</p>
                    <p className="text-sm mt-1">{subscription.notes}</p>
                  </div>
                )}

                <button 
                  onClick={() => setShowExtendModal(true)}
                  className="w-full mt-4 rounded-lg border bg-teal-50 dark:bg-teal-900/20 px-4 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30"
                >
                  Obunani uzaytirish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Extend Subscription Modal */}
      {showExtendModal && center && (
        <ExtendSubscriptionModal
          center={center}
          onClose={() => setShowExtendModal(false)}
          onSuccess={() => {
            setShowExtendModal(false);
            loadData();
          }}
        />
      )}

      {/* Edit Center Modal */}
      {showEditModal && center && (
        <EditCenterModal
          center={center}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
