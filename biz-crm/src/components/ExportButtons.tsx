import { useState } from 'react';
import { FileSpreadsheet, FileText, Printer, ChevronDown } from 'lucide-react';

interface ExportButtonsProps {
  onExportExcel: () => void;
  onExportPDF: () => void;
  onPrint: () => void;
  disabled?: boolean;
}

export function ExportButtons({ onExportExcel, onExportPDF, onPrint, disabled = false }: ExportButtonsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<'excel' | 'pdf' | 'print' | null>(null);

  const handleExport = async (type: 'excel' | 'pdf' | 'print', handler: () => void) => {
    setLoading(type);
    try {
      await handler();
    } finally {
      setLoading(null);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-lg border bg-teal-600 text-white px-4 py-2 text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Eksport
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 z-20 w-48 rounded-lg border bg-card shadow-lg py-1">
            <button
              onClick={() => handleExport('excel', onExportExcel)}
              disabled={loading !== null}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className={`h-4 w-4 text-green-600 ${loading === 'excel' ? 'animate-pulse' : ''}`} />
              <span className="flex-1 text-left">Excel (.xlsx)</span>
              {loading === 'excel' && (
                <div className="h-3 w-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              )}
            </button>

            <button
              onClick={() => handleExport('pdf', onExportPDF)}
              disabled={loading !== null}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className={`h-4 w-4 text-red-600 ${loading === 'pdf' ? 'animate-pulse' : ''}`} />
              <span className="flex-1 text-left">PDF</span>
              {loading === 'pdf' && (
                <div className="h-3 w-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              )}
            </button>

            <button
              onClick={() => handleExport('print', onPrint)}
              disabled={loading !== null}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className={`h-4 w-4 text-blue-600 ${loading === 'print' ? 'animate-pulse' : ''}`} />
              <span className="flex-1 text-left">Print</span>
              {loading === 'print' && (
                <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
