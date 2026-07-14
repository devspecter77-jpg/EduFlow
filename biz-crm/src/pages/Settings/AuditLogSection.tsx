import { RefreshCw, Clock, User, Shield } from 'lucide-react';
import type { AuditLogItem } from '@/lib/api/settings';

const ACTION_COLORS: Record<string, string> = {
  CREATE:           'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  UPDATE:           'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE:           'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  LOGIN:            'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  LOGOUT:           'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  PASSWORD_CHANGE:  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  PAYMENT_MADE:     'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  ATTENDANCE_MARKED:'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE:           'Yaratildi',
  UPDATE:           'Yangilandi',
  DELETE:           'O\'chirildi',
  LOGIN:            'Kirdi',
  LOGOUT:           'Chiqdi',
  PASSWORD_CHANGE:  'Parol',
  PAYMENT_MADE:     'To\'lov',
  ATTENDANCE_MARKED:'Davomat',
};

interface Props {
  logs: AuditLogItem[];
  onRefresh: () => void;
}

export function AuditLogSection({ logs, onRefresh }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold">Audit log</h2>
          <p className="text-xs text-muted-foreground mt-0.5">So'nggi 20 ta amal</p>
        </div>
        <button onClick={onRefresh}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-accent">
          <RefreshCw className="h-4 w-4" /> Yangilash
        </button>
      </div>

      {logs.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <Shield className="h-10 w-10 mx-auto mb-2 opacity-40" />
          <p>Hali hech qanday amal qayd etilmagan</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <div key={log.id}
              className="flex items-start gap-3 rounded-xl border bg-background/50 px-4 py-3 hover:bg-accent/30 transition-colors">
              {/* Icon */}
              <div className="mt-0.5 rounded-lg bg-muted p-2 shrink-0">
                {log.action === 'LOGIN' || log.action === 'LOGOUT'
                  ? <User className="h-4 w-4 text-muted-foreground" />
                  : <Shield className="h-4 w-4 text-muted-foreground" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium
                    ${ACTION_COLORS[log.action] ?? 'bg-muted text-muted-foreground'}`}>
                    {ACTION_LABELS[log.action] ?? log.action}
                  </span>
                  <span className="text-sm font-medium truncate">{log.description}</span>
                  {log.entity && (
                    <span className="text-xs text-muted-foreground">— {log.entity}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(log.createdAt).toLocaleString('uz-UZ')}
                  </span>
                  {log.ipAddress && (
                    <span>IP: {log.ipAddress}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
