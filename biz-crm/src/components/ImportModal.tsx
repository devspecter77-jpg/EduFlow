import { useState, useRef, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload, Download, X, CheckCircle2, AlertCircle,
  FileSpreadsheet, Loader2, ChevronDown, ChevronUp, ArrowRight, Check,
} from 'lucide-react';
import { importExportApi, type ImportResult } from '@/lib/api/import-export';
import { useToast } from '@/contexts/ToastContext';

type Module = 'students' | 'teachers' | 'groups';

interface ImportModalProps {
  module: Module;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Custom Dropdown (dark mode compatible) ───────────────────────────────────
interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  isRequired?: boolean;
  previewValue?: string;
}

function CustomSelect({ value, onChange, options, placeholder = '— Tanlanmagan —', isRequired, previewValue }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const borderColor = isRequired && !value
    ? 'border-red-400 bg-red-950/30'
    : value
      ? 'border-teal-500 bg-teal-950/20'
      : 'border-border';

  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div ref={ref} className="relative flex-1">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`w-full flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm bg-background hover:bg-accent transition-colors ${borderColor}`}
        >
          <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
            {value || placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 top-full mt-1 w-full rounded-lg border bg-popover shadow-lg max-h-52 overflow-y-auto hide-scrollbar">
            {/* Empty option */}
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between ${!value ? 'bg-accent/50' : ''}`}
            >
              <span className="text-muted-foreground italic">{placeholder}</span>
              {!value && <Check className="h-3.5 w-3.5 text-teal-500" />}
            </button>
            {/* Options */}
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center justify-between ${value === opt ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' : ''}`}
              >
                <span>{opt}</span>
                {value === opt && <Check className="h-3.5 w-3.5 text-teal-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview value */}
      {previewValue !== undefined && previewValue !== '' && (
        <span className="text-xs text-muted-foreground bg-muted rounded px-2 py-1 max-w-28 truncate flex-shrink-0">
          {previewValue}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const MODULE_LABELS: Record<Module, string> = {
  students: "O'quvchilar",
  teachers: "O'qituvchilar",
  groups: 'Guruhlar',
};

// Har bir modul uchun CRM maydonlari
const CRM_FIELDS: Record<Module, { key: string; label: string; required: boolean }[]> = {
  students: [
    { key: 'fullName',        label: 'Ism Familya',              required: true  },
    { key: 'phone',           label: 'Telefon',                  required: true  },
    { key: 'parentFullName',  label: 'Ota-ona ism familyasi',    required: false },
    { key: 'parentPhone',     label: 'Ota-ona telefon',          required: false },
    { key: 'gender',          label: 'Jins (MALE/FEMALE)',       required: false },
    { key: 'birthDate',       label: "Tug'ilgan sana",           required: false },
    { key: 'address',         label: 'Manzil',                   required: false },
    { key: 'groupName',       label: 'Guruh nomi',               required: false },
    { key: 'startDate',       label: 'Kelgan sana',              required: false },
    { key: 'paymentType',     label: "To'lov turi (MONTHLY/YEARLY)", required: false },
    { key: 'paymentAmount',   label: "Oylik to'lov",             required: false },
    { key: 'notes',           label: 'Izoh',                     required: false },
    { key: 'status',          label: 'Holati (ACTIVE/INACTIVE)', required: false },
  ],
  teachers: [
    { key: 'fullName',   label: 'Ism Familya',              required: true  },
    { key: 'phone',      label: 'Telefon',                  required: true  },
    { key: 'gender',     label: 'Jins (ERKAK/AYOL)',        required: false },
    { key: 'birthDate',  label: "Tug'ilgan sana",           required: false },
    { key: 'address',    label: 'Manzil',                   required: false },
    { key: 'education',  label: "Ta'lim",                   required: false },
    { key: 'experience', label: 'Tajriba (yil)',            required: false },
    { key: 'salary',     label: 'Oylik maosh',              required: false },
    { key: 'hireDate',   label: 'Ishga qabul sanasi',       required: false },
    { key: 'status',     label: 'Holati (FAOL/FAOLSIZ)',   required: false },
    { key: 'notes',      label: 'Izoh',                     required: false },
  ],
  groups: [
    { key: 'name',        label: 'Guruh nomi',    required: true  },
    { key: 'subject',     label: 'Fan',           required: true  },
    { key: 'level',       label: 'Daraja',        required: false },
    { key: 'maxStudents', label: 'Max talabalar', required: false },
    { key: 'room',        label: 'Xona',          required: false },
    { key: 'description', label: 'Izoh',          required: false },
  ],
};

type Step = 'upload' | 'mapping' | 'result';

export function ImportModal({ module, onClose, onSuccess }: ImportModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  // Excel ustunlari (fayl yuklanganda aniqlanadi)
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);

  // Mapping: crmFieldKey -> excelColumn
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const handleFile = useCallback((f: File) => {
    if (!f.name.match(/\.(xlsx|xls)$/i)) {
      showToast('error', 'Faqat Excel fayllari (.xlsx, .xls) qabul qilinadi');
      return;
    }
    setFile(f);
    setResult(null);

    // Excel ustunlarini o'qib olish
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];

        if (rows.length === 0) {
          showToast('error', 'Excel fayl bo\'sh');
          return;
        }

        const cols = Object.keys(rows[0]);
        setExcelColumns(cols);
        setPreviewRows(rows.slice(0, 3));

        // ─── Kuchli Auto-mapping algoritmi ────────────────────────────────
        // Har bir CRM maydoni uchun mumkin bo'lgan kalit so'zlar ro'yxati
        const FIELD_ALIASES: Record<string, string[]> = {
          // Students
          fullName:       ['fullname', 'ismfamilya', 'ismi', 'familya', 'ism', 'full name', 'name', 'fullname', 'to\'liqism', 'toliqism', 'isimfamilya', 'ism familya'],
          phone:          ['phone', 'telefon', 'tel', 'raqam', 'phonenumber', 'telefonnomer', 'mobil', 'mobile', 'contact', 'telefon raqam'],
          parentFullName: ['parentfullname', 'otaona', 'ota-ona', 'otaonaismi', 'otaonafamilya', 'parent', 'parentname', 'otaonaisimfamilya', 'onaismi', 'otaismi', 'oilaismi', 'ota-ona ism familyasi', 'otaona ism familyasi'],
          parentPhone:    ['parentphone', 'otaonatelefon', 'ota-onatelefon', 'otaonaraqam', 'parenttel', 'parentmobile', 'otaonatelfon', 'otaonatel', 'oilatelefon', 'ota-ona telefon', 'otaona telefon raqami', 'ota-ona telefon raqami'],
          gender:         ['gender', 'jins', 'sex'],
          birthDate:      ['birthdate', 'tugilgansana', 'tug\'ilgansana', 'birth', 'dob', 'dateofbirth', 'tugilgan', "tug'ilgan sana", 'tugilgan sana'],
          address:        ['address', 'manzil', 'yashashjoyi', 'location', 'addr'],
          groupName:      ['groupname', 'guruh', 'group', 'guruhismi', 'guruhnom', 'sinf', 'class', 'guruh nomi'],
          startDate:      ['startdate', 'keldisana', 'kelgansana', 'start', 'qabulqilinsana', 'qabulsana', 'kelgan sana'],
          paymentType:    ['paymenttype', 'tolovturi', 'paytype', "to'lov turi"],
          paymentAmount:  ['paymentamount', 'tolov', 'payment', 'summa', 'narx', 'fee', 'monthlyfee', 'oyliktolov', "oylik to'lov"],
          notes:          ['notes', 'izoh', 'note', 'comment', 'qaydlar', 'eslatma'],
          status:         ['status', 'holati', 'holat', 'state'],
          nextPaymentDate:['nextpaymentdate', 'keyingitolovsana', 'nextdate', "keyingi to'lov sanasi"],
          // Teachers
          education:      ['education', 'talim', 'ta\'lim', 'malumot', 'ma\'lumot', 'edu', 'degree', "ta'lim"],
          experience:     ['experience', 'tajriba', 'staj', 'exp', 'yillik', 'tajriba (yil)'],
          salary:         ['salary', 'maosh', 'ish haqi', 'ishhaqi', 'oylikmaosh', 'oylik', 'oylik maosh'],
          hireDate:       ['hiredate', 'ishgakirgansana', 'ishdaqabulqilinsana', 'hireday', 'startwork', 'ishga qabul sanasi'],
          // Groups
          subject:        ['subject', 'fan', 'kurs', 'course', 'dars'],
          level:          ['level', 'daraja', 'bosqich', 'sinf'],
          maxStudents:    ['maxstudents', 'maxtallabalar', 'maxtalaba', 'limit', 'max', 'max talabalar'],
          room:           ['room', 'xona', 'auditoriya', 'cabinet'],
          description:    ['description', 'izoh', 'tavsif', 'haqida'],
        };

        // Normalize helper: faqat harflar va raqamlar, kichik harf
        const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9а-яёa-z']/gi, '');

        const autoMap: Record<string, string> = {};
        const usedCols = new Set<string>();
        const fields = CRM_FIELDS[module];

        for (const field of fields) {
          const aliases = FIELD_ALIASES[field.key] || [];
          const fieldNorm = norm(field.key);
          const labelNorm = norm(field.label);

          const matched = cols.find(col => {
            if (usedCols.has(col)) return false;
            const colNorm = norm(col);
            // 1. To'liq moslik
            if (colNorm === fieldNorm || colNorm === labelNorm) return true;
            // 2. Alias'lar bilan moslik
            if (aliases.some(a => norm(a) === colNorm || colNorm.includes(norm(a)) || norm(a).includes(colNorm))) return true;
            // 3. Qisman moslik (kamida 4 harf)
            if (colNorm.length >= 4 && (fieldNorm.includes(colNorm) || colNorm.includes(fieldNorm))) return true;
            if (colNorm.length >= 4 && (labelNorm.includes(colNorm) || colNorm.includes(labelNorm))) return true;
            return false;
          });

          if (matched) {
            autoMap[field.key] = matched;
            usedCols.add(matched);
          }
        }
        setMapping(autoMap);
      } catch {
        showToast('error', 'Excel faylni o\'qishda xatolik');
      }
    };
    reader.readAsArrayBuffer(f);
  }, [module, showToast]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleTemplateDownload = () => {
    const url =
      module === 'students' ? importExportApi.getStudentTemplateUrl()
        : module === 'teachers' ? importExportApi.getTeacherTemplateUrl()
          : importExportApi.getGroupTemplateUrl();
    const a = document.createElement('a');
    a.href = url;
    a.download = `${module}_template.xlsx`;
    a.click();
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      // Excel'ni qayta o'qib, mapping orqali yangi data yaratish
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target!.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];

          // Mapping orqali yangi rows yaratish
          const mappedRows = rows.map(row => {
            const newRow: Record<string, unknown> = {};
            for (const [crmKey, excelCol] of Object.entries(mapping)) {
              if (excelCol && row[excelCol] !== undefined) {
                newRow[crmKey] = row[excelCol];
              }
            }
            return newRow;
          });

          // Yangi Excel fayl yaratish mapped data bilan
          const newWs = XLSX.utils.json_to_sheet(mappedRows);
          const newWb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(newWb, newWs, 'Sheet1');
          const buffer = XLSX.write(newWb, { type: 'array', bookType: 'xlsx' });
          const mappedFile = new File([buffer], file.name, { type: file.type });

          let res: ImportResult;
          if (module === 'students') res = await importExportApi.importStudents(mappedFile);
          else if (module === 'teachers') res = await importExportApi.importTeachers(mappedFile);
          else res = await importExportApi.importGroups(mappedFile);

          setResult(res);
          setStep('result');
          if (res.imported > 0) {
            showToast('success', `${res.imported} ta ${MODULE_LABELS[module]} import qilindi`);
            onSuccess();
          }
          if (res.skipped > 0) {
            showToast('error', `${res.skipped} ta qator o'tkazib yuborildi`);
          }
        } catch {
          showToast('error', 'Import qilishda xatolik yuz berdi');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch {
      showToast('error', 'Import qilishda xatolik yuz berdi');
      setLoading(false);
    }
  };

  const requiredMapped = CRM_FIELDS[module]
    .filter(f => f.required)
    .every(f => mapping[f.key]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-2xl border bg-card shadow-xl flex flex-col" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            <h2 className="font-semibold text-lg">{MODULE_LABELS[module]} Import</h2>
          </div>
          {/* Steps */}
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${step === 'upload' ? 'bg-teal-600 text-white' : 'bg-muted text-muted-foreground'}`}>
              1. Fayl
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${step === 'mapping' ? 'bg-teal-600 text-white' : 'bg-muted text-muted-foreground'}`}>
              2. Ustunlar
            </span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${step === 'result' ? 'bg-teal-600 text-white' : 'bg-muted text-muted-foreground'}`}>
              3. Natija
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {/* ─── STEP 1: UPLOAD ─────────────────────────────────────────────── */}
          {step === 'upload' && (
            <div className="p-6 space-y-5">
              {/* Template Download */}
              <div className="rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Shablon (Template) yuklab oling</p>
                    <p className="text-xs text-muted-foreground mt-0.5">To'g'ri formatda ma'lumot kiriting</p>
                  </div>
                  <button
                    onClick={handleTemplateDownload}
                    className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Shablon
                  </button>
                </div>
              </div>

              {/* File Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : file
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                      : 'border-muted-foreground/30 hover:border-primary hover:bg-accent/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileSpreadsheet className="h-10 w-10 text-green-600" />
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB • {excelColumns.length} ta ustun</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setExcelColumns([]); setPreviewRows([]); setMapping({}); }}
                      className="mt-1 text-xs text-destructive hover:underline"
                    >
                      Faylni o'chirish
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="font-medium text-sm">Excel faylni bu yerga tashlang</p>
                    <p className="text-xs text-muted-foreground">yoki bosing (.xlsx, .xls)</p>
                  </div>
                )}
              </div>

              {/* Preview */}
              {previewRows.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Ko'rinish (dastlabki {previewRows.length} qator):</p>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="text-xs w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          {excelColumns.map(col => (
                            <th key={col} className="px-3 py-2 text-left font-medium whitespace-nowrap">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <tr key={i} className="border-t">
                            {excelColumns.map(col => (
                              <td key={col} className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">
                                {String(row[col] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 2: MAPPING ────────────────────────────────────────────── */}
          {step === 'mapping' && (
            <div className="p-6 space-y-4">
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 text-sm text-blue-700 dark:text-blue-300">
                Excel faylingizdagi ustunlarni CRM maydonlariga moslashtiring.
                <span className="text-red-500 font-medium"> * </span>belgili maydonlar majburiy.
                Tanlanmagan maydonlar bo'sh qoladi.
              </div>

              <div className="space-y-3">
                {CRM_FIELDS[module].map((field) => (
                  <div key={field.key} className="flex items-center gap-3">
                    {/* CRM maydon */}
                    <div className="w-52 flex-shrink-0">
                      <span className={`text-sm font-medium ${field.required ? '' : 'text-muted-foreground'}`}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </div>

                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                    {/* Excel ustun tanlov */}
                    <CustomSelect
                      value={mapping[field.key] || ''}
                      onChange={(val) => setMapping(prev => ({ ...prev, [field.key]: val }))}
                      options={excelColumns}
                      placeholder="— Tanlanmagan (bo'sh qoladi) —"
                      isRequired={field.required}
                      previewValue={
                        mapping[field.key] && previewRows[0]?.[mapping[field.key]] !== undefined
                          ? String(previewRows[0][mapping[field.key]])
                          : undefined
                      }
                    />
                  </div>
                ))}
              </div>

              {!requiredMapped && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
                  Majburiy maydonlar tanlanmagan. Ularni tanlang.
                </div>
              )}
            </div>
          )}

          {/* ─── STEP 3: RESULT ─────────────────────────────────────────────── */}
          {step === 'result' && result && (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                {result.imported > 0
                  ? <CheckCircle2 className="h-6 w-6 text-green-600" />
                  : <AlertCircle className="h-6 w-6 text-yellow-600" />}
                <p className="font-semibold">Import natijalari</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-green-100 dark:bg-green-900/20 p-4 text-center">
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">{result.imported}</p>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-1">Qo'shildi</p>
                </div>
                <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/20 p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{result.skipped}</p>
                  <p className="text-sm text-yellow-600 mt-1">O'tkazildi</p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-3xl font-bold">{result.total}</p>
                  <p className="text-sm text-muted-foreground mt-1">Jami</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowErrors(!showErrors)}
                    className="flex items-center gap-1 text-sm text-destructive hover:underline"
                  >
                    {showErrors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {result.errors.length} ta xato ko'rish
                  </button>
                  {showErrors && (
                    <div className="mt-2 max-h-48 overflow-y-auto hide-scrollbar rounded-lg border">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left">Qator</th>
                            <th className="px-3 py-2 text-left">Maydon</th>
                            <th className="px-3 py-2 text-left">Xato</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.errors.map((err, i) => (
                            <tr key={i} className="border-t">
                              <td className="px-3 py-1.5 text-muted-foreground">{err.row}</td>
                              <td className="px-3 py-1.5 font-medium">{err.field}</td>
                              <td className="px-3 py-1.5 text-destructive">{err.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4 flex-shrink-0">
          <div>
            {step === 'mapping' && (
              <button
                onClick={() => setStep('upload')}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-accent transition-colors"
              >
                ← Orqaga
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-accent transition-colors"
            >
              {step === 'result' ? 'Yopish' : 'Bekor qilish'}
            </button>

            {step === 'upload' && file && excelColumns.length > 0 && (
              <button
                onClick={() => setStep('mapping')}
                className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 transition-colors"
              >
                Keyingisi →
              </button>
            )}

            {step === 'mapping' && (
              <button
                onClick={handleImport}
                disabled={!requiredMapped || loading}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Import qilinmoqda...</>
                  : <><Upload className="h-4 w-4" /> Import qilish</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
