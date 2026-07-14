import { useState } from 'react';
import { Users, GraduationCap, UsersRound, ClipboardCheck, Wallet } from 'lucide-react';
import { StudentsReport } from './StudentsReport';
import { AttendanceReport } from './AttendanceReport';
import { PaymentsReport } from './PaymentsReport';
import { GroupsReport } from './GroupsReport';
import { TeachersReport } from './TeachersReport';

type Tab = 'students' | 'teachers' | 'groups' | 'attendance' | 'payments';

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: 'students', label: "O'quvchilar", icon: Users },
  { id: 'teachers', label: "O'qituvchilar", icon: GraduationCap },
  { id: 'groups', label: 'Guruhlar', icon: UsersRound },
  { id: 'attendance', label: 'Davomat', icon: ClipboardCheck },
  { id: 'payments', label: "To'lovlar", icon: Wallet },
];

export function Reports() {
  const [activeTab, setActiveTab] = useState<Tab>('students');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Hisobotlar</h1>
        <p className="mt-1 text-muted-foreground">Barcha ma'lumotlar real database dan</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border bg-muted/30 p-1 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'students' && <StudentsReport />}
      {activeTab === 'teachers' && <TeachersReport />}
      {activeTab === 'groups' && <GroupsReport />}
      {activeTab === 'attendance' && <AttendanceReport />}
      {activeTab === 'payments' && <PaymentsReport />}
    </div>
  );
}
