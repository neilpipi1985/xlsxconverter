import XLSX from 'xlsx';

class XlsxMgr {
  static get newWorkBook() {
    return XLSX.utils.book_new();
  }

  static getWorkBook(buffer, opts = {}) {
    return XLSX.read(buffer, opts);
  }

  static getSheetFromBuffer(buffer, opts = {}, sheetIndex = 0) {
    const workbook = XLSX.read(buffer, opts); // only *.xlsx?
    const sheetName = workbook.SheetNames[sheetIndex];
    return workbook.Sheets[sheetName];
  }

  static getSheetHeaders(worksheet = {}, headerRowIndex = 0) {
    const headers = [];

    const range = XLSX.utils.decode_range(worksheet['!ref']);

    if (headerRowIndex > 0) {
      range.s.r = headerRowIndex; // <-- zero-indexed, so setting to headerRowIndex will skip row 0 - (headerRowIndex - 1)
      worksheet['!ref'] = XLSX.utils.encode_range(range);
    }
    const row = range.s.r; /* start in the first row */
    /* walk every column in the range */
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const cell = worksheet[XLSX.utils.encode_cell({ c: col, r: row })]; /* find the cell in the first row */

      const hdr = (cell && cell.t) ? XLSX.utils.format_cell(cell) : `UNKNOWN_${col}`; // <-- replace with your desired default

      headers.push(hdr);
    }

    return headers;
  }

  static getSheetData(worksheet = {}, headerRowIndex = 0) {
    if (headerRowIndex > 0) {
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      range.s.r = headerRowIndex; // <-- zero-indexed, so setting to headerRowIndex will skip row 0 - (headerRowIndex - 1)
      worksheet['!ref'] = XLSX.utils.encode_range(range);
    }

    return XLSX.utils.sheet_to_json(worksheet);
  }

  static transferDataToWorkbook(workbook = XLSX.utils.book_new(), sheetName = '', dataList = [], opts = {}) {
    const sheet = XLSX.utils.json_to_sheet(dataList, opts);
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName);

    return workbook;
  }

  static writeFile(workbook, wbOpts = { bookType: 'xlsx', bookSST: false, type: 'array' }) {
    return XLSX.writeFile(workbook, wbOpts);
  }

  static write(workbook, wbOpts = { bookType: 'xlsx', bookSST: false, type: 'array' }) {
    return XLSX.write(workbook, wbOpts);
  }
}

export default XlsxMgr;
