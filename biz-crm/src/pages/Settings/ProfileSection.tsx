import { useState } from 'react';
import { User, Lock, RefreshCw, Save, Eye, EyeOff, Sun, Moon, Monitor } from 'lucide-react';
import { profileApi } from '@/lib/api/settings';
import type { UserProfile } from '@/lib/api/settings';
import { useApp } from '@/contexts/AppContext';

const INPUT = "w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50";

type Theme = 'light' | 'dark' | 'system';

interface Props {
  profile: UserProfile | null;
  centerAddress?: string | null;
  passwordOnly?: boolean;
  appTheme: Theme;
  onThemeChange: (t: Theme) => void;
  onUpdated: (p: UserProfile) => void;
  onToast: (msg: string, type?: 'success' | 'error') => void;
}

const THEME_OPTIONS: Array<{ value: Theme; icon: React.ElementType; labelKey: 'themeLight' | 'themeDark' | 'themeSystem' }> = [
  { value: 'light',  icon: Sun,     labelKey: 'themeLight' },
  { value: 'dark',   icon: Moon,    labelKey: 'themeDark' },
  { value: 'system', icon: Monitor, labelKey: 'themeSystem' },
];

export function ProfileSection({
  profile,
  centerAddress,
  passwordOnly = false,
  appTheme,
  onThemeChange,
  onUpdated,
  onToast,
}: Props) {
  const { t, language } = useApp();
  const s = t.settings;

  const [form, setForm] = useState({
    fullName:   profile?.fullName   ?? '',
    phone:      profile?.phone      ?? '',
    centerName: profile?.centerName ?? '',
    address:    centerAddress       ?? '',
  });
  const [pwd, setPwd]         = useState({ current: '', newPwd: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });
  const [saving, setSaving]       = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const handleProfileSave = async () => {
    if (!form.fullName.trim() || !form.phone.trim()) {
      onToast(s.profile.phoneRequired, 'error');
      return;
    }
    setSaving(true);
    try {
      const updated = await profileApi.update({
        fullName:   form.fullName,
        phone:      form.phone,
        centerName: form.centerName,
      });
      onUpdated(updated);
      onToast(s.profile.profileSaved);
    } catch (e: any) {
      onToast(e?.response?.data?.error?.message || t.settings.error, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (!pwd.current || !pwd.newPwd || !pwd.confirm) {
      onToast(s.security.allRequired, 'error');
      return;
    }
    if (pwd.newPwd !== pwd.confirm) {
      onToast(s.security.mismatch, 'error');
      return;
    }
    if (pwd.newPwd.length < 6) {
      onToast(s.security.tooShort, 'error');
      return;
    }
    setSavingPwd(true);
    try {
      await profileApi.changePassword({
        currentPassword: pwd.current,
        newPassword:     pwd.newPwd,
        confirmPassword: pwd.confirm,
      });
      setPwd({ current: '', newPwd: '', confirm: '' });
      onToast(s.security.success);
    } catch (e: any) {
      onToast(e?.response?.data?.error?.message || s.security.error, 'error');
    } finally {
      setSavingPwd(false);
    }
  };

  if (!profile) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <User className="h-10 w-10 mx-auto mb-2 opacity-40" />
        <p>{t.common.loading}</p>
      </div>
    );
  }

  const roleLabel = t.roles[profile.role as keyof typeof t.roles] ?? profile.role;

  return (
    <div className="space-y-8">

      {/* ── Profile info ── */}
      {!passwordOnly && (
        <div>
          {/* Avatar + name row */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b">
            <div className="h-16 w-16 rounded-full bg-teal-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-lg leading-tight">{profile.fullName}</p>
              <p className="text-sm text-muted-foreground">{profile.phone}</p>
              {centerAddress && (
                <p className="text-xs text-muted-foreground mt-0.5">📍 {centerAddress}</p>
              )}
              <span className="inline-block mt-1 rounded-full bg-teal-50 dark:bg-teal-900/30 px-2.5 py-0.5 text-xs font-medium text-teal-700 dark:text-teal-400">
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Last login info */}
          {profile.lastLoginAt && (
            <div className="mb-6 rounded-lg bg-muted/30 border px-4 py-2.5 text-xs text-muted-foreground flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 shrink-0" />
              <span>
                {s.profile.lastLogin}: {new Date(profile.lastLoginAt).toLocaleString(
                  language === 'UZ' ? 'uz-UZ' : language === 'RU' ? 'ru-RU' : 'en-US'
                )}
                {profile.lastLoginIp && ` — IP: ${profile.lastLoginIp}`}
              </span>
            </div>
          )}

          {/* Personal info form */}
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <User className="h-4 w-4" /> {s.profile.personalInfo}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">{s.profile.fullNameRequired}</label>
              <input className={INPUT} value={form.fullName}
                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                placeholder={s.profile.fullName} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{s.profile.phone}</label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-lg border border-r-0 bg-muted px-3 py-2 text-sm text-muted-foreground select-none">
                  +998
                </span>
                <input
                  className="flex-1 rounded-r-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={form.phone.replace(/^\+998\s?/, '')}
                  maxLength={12}
                  placeholder="90 000 00 00"
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                    let fmt = digits;
                    if (digits.length > 2) fmt = digits.slice(0,2)+' '+digits.slice(2);
                    if (digits.length > 5) fmt = digits.slice(0,2)+' '+digits.slice(2,5)+' '+digits.slice(5);
                    if (digits.length > 7) fmt = digits.slice(0,2)+' '+digits.slice(2,5)+' '+digits.slice(5,7)+' '+digits.slice(7);
                    setForm(p => ({ ...p, phone: digits.length > 0 ? '+998 '+fmt : '' }));
                  }}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{s.profile.centerName}</label>
              <input className={INPUT} value={form.centerName}
                onChange={e => setForm(p => ({ ...p, centerName: e.target.value }))}
                placeholder={s.profile.centerName} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">{s.profile.address}</label>
              <input className={INPUT} value={form.address}
                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                placeholder={s.profile.addressPlaceholder} />
            </div>
          </div>

          {/* ── Theme selector ── */}
          <div className="mt-6">
            <label className="text-sm font-semibold mb-3 block">{s.profile.theme}</label>
            <div className="inline-flex rounded-lg border bg-muted/30 p-1">
              {THEME_OPTIONS.map(({ value, icon: Icon, labelKey }) => (
                <button
                  key={value}
                  onClick={() => onThemeChange(value)}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all
                    ${appTheme === value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{s.crm[labelKey]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button onClick={handleProfileSave} disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {s.profile.saveProfile}
            </button>
          </div>
        </div>
      )}

      {/* ── Password change ── */}
      <div>
        <h3 className="text-sm font-semibold mb-4 pb-4 border-b flex items-center gap-2">
          <Lock className="h-4 w-4" /> {s.security.title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1.5 block">{s.security.current}</label>
            <div className="relative">
              <input
                className={`${INPUT} pr-10`}
                type={showPwd.current ? 'text' : 'password'}
                value={pwd.current}
                onChange={e => setPwd(p => ({ ...p, current: e.target.value }))}
                placeholder={s.security.currentPlaceholder}
              />
              <button type="button"
                onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPwd.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{s.security.new}</label>
            <div className="relative">
              <input
                className={`${INPUT} pr-10`}
                type={showPwd.new ? 'text' : 'password'}
                value={pwd.newPwd}
                onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))}
                placeholder={s.security.newPlaceholder}
              />
              <button type="button"
                onClick={() => setShowPwd(p => ({ ...p, new: !p.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPwd.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">{s.security.confirm}</label>
            <div className="relative">
              <input
                className={`${INPUT} pr-10`}
                type={showPwd.confirm ? 'text' : 'password'}
                value={pwd.confirm}
                onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
                placeholder={s.security.confirmPlaceholder}
              />
              <button type="button"
                onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPwd.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={handlePasswordSave} disabled={savingPwd}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50">
            {savingPwd ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            {s.security.save}
          </button>
        </div>
      </div>
    </div>
  );
}
