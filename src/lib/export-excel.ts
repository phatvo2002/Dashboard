import * as XLSX from 'xlsx';

export function exportToExcel(data: Record<string, any>[], fileName: string, sheetName: string = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Auto-fit column widths
  const maxProps = Object.keys(data[0] || {});
  const colWidths = maxProps.map(key => {
    let maxLen = key.length;
    data.forEach(row => {
      const val = row[key] ? String(row[key]) : '';
      if (val.length > maxLen) maxLen = Math.min(val.length, 50);
    });
    return { wch: Math.max(maxLen + 3, 12) };
  });
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
