import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================
// EXCEL EXPORT
// ============================================================

export interface ExcelExportOptions {
  filename: string;
  sheetName: string;
  headers: string[];
  data: (string | number)[][];
  columnWidths?: number[];
}

export function exportToExcel(options: ExcelExportOptions): void {
  const { filename, sheetName, headers, data, columnWidths } = options;

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const wsData = [headers, ...data];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  if (columnWidths) {
    ws['!cols'] = columnWidths.map(w => ({ wch: w }));
  } else {
    // Auto-calculate widths based on content
    const colWidths = headers.map((h, i) => {
      const maxLen = Math.max(
        h.length,
        ...data.map(row => String(row[i] || '').length)
      );
      return { wch: Math.min(maxLen + 2, 50) }; // Max 50 chars
    });
    ws['!cols'] = colWidths;
  }

  // Style header row (bold)
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + '1';
    if (!ws[address]) continue;
    ws[address].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'E0E0E0' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${date}.xlsx`;

  // Download file
  XLSX.writeFile(wb, fullFilename);
}

// ============================================================
// PDF EXPORT
// ============================================================

export interface PDFExportOptions {
  filename: string;
  title: string;
  centerName?: string;
  headers: string[];
  data: (string | number)[][];
  summary?: { label: string; value: string }[];
}

export function exportToPDF(options: PDFExportOptions): void {
  const { filename, title, centerName, headers, data, summary } = options;

  // Create PDF document (A4 size)
  const doc = new jsPDF('l', 'mm', 'a4'); // landscape mode for wide tables
  
  let yPos = 20;

  // Add center name
  if (centerName) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(centerName, 15, yPos);
    yPos += 8;
  }

  // Add title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 15, yPos);
  yPos += 8;

  // Add export date
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const date = new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Sana: ${date}`, 15, yPos);
  yPos += 10;

  // Add table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: yPos,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [13, 148, 136], // teal-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 15, right: 15 },
  });

  // Add summary if provided
  if (summary && summary.length > 0) {
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || yPos + 50;
    let summaryY = finalY + 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Umumiy:', 15, summaryY);
    summaryY += 6;

    doc.setFont('helvetica', 'normal');
    summary.forEach(item => {
      doc.text(`${item.label}: ${item.value}`, 15, summaryY);
      summaryY += 6;
    });
  }

  // Generate filename with date
  const dateStr = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${dateStr}.pdf`;

  // Download file
  doc.save(fullFilename);
}

// ============================================================
// PRINT
// ============================================================

export interface PrintOptions {
  title: string;
  centerName?: string;
  headers: string[];
  data: (string | number)[][];
  summary?: { label: string; value: string }[];
}

export function printReport(options: PrintOptions): void {
  const { title, centerName, headers, data, summary } = options;

  // Create print window content
  const date = new Date().toLocaleDateString('uz-UZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @media print {
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 10pt;
          }
        }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        .header {
          margin-bottom: 20px;
          border-bottom: 2px solid #0d9488;
          padding-bottom: 10px;
        }
        .center-name {
          font-size: 12pt;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .title {
          font-size: 16pt;
          font-weight: bold;
          color: #0d9488;
          margin-bottom: 5px;
        }
        .date {
          font-size: 9pt;
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background-color: #0d9488;
          color: white;
          padding: 8px;
          text-align: left;
          font-weight: bold;
          border: 1px solid #ddd;
        }
        td {
          padding: 6px 8px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f5f5f5;
        }
        .summary {
          margin-top: 20px;
          padding: 15px;
          background-color: #f0f9ff;
          border-left: 4px solid #0d9488;
        }
        .summary-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #0d9488;
        }
        .summary-item {
          margin: 5px 0;
        }
        @media print {
          .no-print {
            display: none;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${centerName ? `<div class="center-name">${centerName}</div>` : ''}
        <div class="title">${title}</div>
        <div class="date">Sana: ${date}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${row.map(cell => `<td>${cell}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      ${summary && summary.length > 0 ? `
        <div class="summary">
          <div class="summary-title">Umumiy:</div>
          ${summary.map(item => `
            <div class="summary-item">
              <strong>${item.label}:</strong> ${item.value}
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  } else {
    alert('Pop-up blocker himoyasi yoqilgan. Iltimos, ruxsat bering.');
  }
}

// ============================================================
// CSV EXPORT (existing - keeping for compatibility)
// ============================================================

export function exportToCSV(
  filename: string,
  headers: string[],
  data: (string | number)[][]
): void {
  const csv = [
    headers.join(','),
    ...data.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  const date = new Date().toISOString().split('T')[0];
  link.download = `${filename}_${date}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
