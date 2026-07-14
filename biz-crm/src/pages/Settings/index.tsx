import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2, Shield, User,
  Save, RefreshCw, AlertCircle, CheckCircle2,
  Clock, Globe, ChevronRight,
} from 'lucide-react';
import { settingsApi, profileApi, auditLogApi } from '@/lib/api/settings';
import type { AppSettings, UserProfile, AuditLogItem } from '@/lib/api/settings';
import { ProfileSection } from '@/pages/Settings/ProfileSection';
import { AuditLogSection } from '@/pages/Settings/AuditLogSection';
import { useApp } from '@/contexts/AppContext';

type Tab = 'center' | 'profile' | 'security' | 'audit';

const INPUT = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50";

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-lg text-white
      ${type === 'success' ? 'bg-teal-600' : 'bg-red-500'}`}>
      {type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      {msg}
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">
        {label}
        {hint && <span className="text-xs text-muted-foreground ml-2">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

export function Settings() {
  const { t, theme: appTheme, setTheme: setAppTheme } = useApp();
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'center';
  const [tab, setTab]             = useState<Tab>(initialTab);
  const [settings, setSettings]   = useState<AppSettings | null>(null);
  const [profile, setProfile]     = useState<UserProfile | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([settingsApi.get(), profileApi.get()]);
      setSettings(s);
      setProfile(p);
    } catch {
      showToast(t.settings.loadError, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, t]);

  const loadAuditLogs = useCallback(async () => {
    try {
      const logs = await auditLogApi.getRecent(20);
      setAuditLogs(logs);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (tab === 'audit') loadAuditLogs(); }, [tab, loadAuditLogs]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const updated = await settingsApi.update(settings);
      setSettings(updated);
      showToast(t.settings.saved);
    } catch {
      showToast(t.settings.error, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm(t.settings.resetConfirm)) return;
    setSaving(true);
    try {
      const reset = await settingsApi.reset();
      setSettings(reset);
      showToast(t.settings.resetSuccess);
    } catch {
      showToast(t.settings.error, 'error');
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
    { id: 'center',   label: t.settings.tabs.center,   icon: Building2 },
    { id: 'profile',  label: t.settings.tabs.profile,  icon: User },
    { id: 'security', label: t.settings.tabs.security, icon: Shield },
    { id: 'audit',    label: t.settings.tabs.audit,    icon: Clock },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-12 bg-muted rounded" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    );
  }

  const showSaveBar = tab === 'center';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{t.settings.title}</h1>
          <p className="mt-1 text-muted-foreground text-sm">{t.settings.subtitle}</p>
        </div>
        {showSaveBar && (
          <div className="flex gap-2">
            <button onClick={handleReset} disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent disabled:opacity-50">
              <RefreshCw className="h-4 w-4" /> {t.settings.reset}
            </button>
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? t.settings.saving : t.settings.save}
            </button>
          </div>
        )}
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border bg-muted/30 p-1">
        {TABS.map(tb => {
          const Icon = tb.icon;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-all
                ${tab === tb.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <Icon className="h-4 w-4" /> {tb.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="rounded-xl border bg-card p-6">

        {/* ── Markaz ma'lumotlari ── */}
        {tab === 'center' && settings && (
          <div>
            <div className="mb-6 pb-4 border-b">
              <h2 className="text-lg font-semibold">{t.settings.center.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t.settings.center.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FieldRow label={t.settings.center.name} hint={t.settings.center.nameHint}>
                <input className={INPUT} value={settings.centerName}
                  onChange={e => set('centerName', e.target.value)}
                  placeholder={t.settings.center.namePlaceholder} />
              </FieldRow>

              <FieldRow label={t.settings.center.phone}>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 bg-muted px-3 py-2 text-sm text-muted-foreground select-none whitespace-nowrap">
                    +998
                  </span>
                  <input
                    className="flex-1 rounded-r-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={(settings.phone ?? '').replace(/^\+998\s?/, '')}
                    maxLength={12}
                    placeholder="90 000 00 00"
                    onChange={e => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                      let fmt = digits;
                      if (digits.length > 2) fmt = digits.slice(0,2)+' '+digits.slice(2);
                      if (digits.length > 5) fmt = digits.slice(0,2)+' '+digits.slice(2,5)+' '+digits.slice(5);
                      if (digits.length > 7) fmt = digits.slice(0,2)+' '+digits.slice(2,5)+' '+digits.slice(5,7)+' '+digits.slice(7);
                      set('phone', digits.length > 0 ? '+998 '+fmt : null);
                    }}
                  />
                </div>
              </FieldRow>

              <FieldRow label={t.settings.center.workingHours} hint={t.settings.center.workingHoursHint}>
                <input className={INPUT} value={settings.workingHours ?? ''}
                  onChange={e => set('workingHours', e.target.value || null)}
                  placeholder={t.settings.center.workingHoursPlaceholder} />
              </FieldRow>

              <FieldRow label={t.settings.center.address}>
                <input className={INPUT} value={settings.address ?? ''}
                  onChange={e => set('address', e.target.value || null)}
                  placeholder={t.settings.center.addressPlaceholder} />
              </FieldRow>

              <FieldRow label={t.settings.center.telegram}>
                <input className={INPUT} value={settings.telegram ?? ''}
                  onChange={e => set('telegram', e.target.value || null)} placeholder="@markaz_uz" />
              </FieldRow>

              <FieldRow label={t.settings.center.instagram}>
                <input className={INPUT} value={settings.instagram ?? ''}
                  onChange={e => set('instagram', e.target.value || null)} placeholder="@markaz.uz" />
              </FieldRow>

              <div className="md:col-span-2">
                <FieldRow label={t.settings.center.description}>
                  <textarea className={`${INPUT} resize-none`} rows={3} value={settings.description ?? ''}
                    onChange={e => set('description', e.target.value || null)}
                    placeholder={t.settings.center.descriptionPlaceholder} />
                </FieldRow>
              </div>
            </div>
          </div>
        )}

        {/* ── Profil ── */}
        {tab === 'profile' && (
          <ProfileSection
            profile={profile}
            centerAddress={settings?.address ?? null}
            onUpdated={(p: UserProfile) => setProfile(p)}
            onToast={showToast}
            appTheme={appTheme}
            onThemeChange={setAppTheme}
          />
        )}

        {/* ── Xavfsizlik ── */}
        {tab === 'security' && (
          <ProfileSection
            profile={profile}
            centerAddress={settings?.address ?? null}
            onUpdated={(p: UserProfile) => setProfile(p)}
            onToast={showToast}
            passwordOnly
            appTheme={appTheme}
            onThemeChange={setAppTheme}
          />
        )}

        {/* ── Audit Log ── */}
        {tab === 'audit' && (
          <AuditLogSection logs={auditLogs} onRefresh={loadAuditLogs} />
        )}
      </div>

      {/* System info footer */}
      {tab === 'center' && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card px-4 py-3 text-xs text-muted-foreground">
          <Globe className="h-3.5 w-3.5" />
          <span>EduFlow CRM v2.0.0</span>
          <ChevronRight className="h-3 w-3" />
          <span>Neon PostgreSQL</span>
          <ChevronRight className="h-3 w-3" />
          <span>Koyeb Backend</span>
          <ChevronRight className="h-3 w-3" />
          <span>Vercel Frontend</span>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
