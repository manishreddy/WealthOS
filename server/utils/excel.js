'use strict';

const ExcelJS = require('exceljs');
const { Readable } = require('stream');

async function readWorkbookFromBuffer(buffer) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer);
  return wb;
}

async function readCsvFromBuffer(buffer) {
  const wb = new ExcelJS.Workbook();
  const stream = Readable.from(buffer);
  await wb.csv.read(stream);
  return wb;
}

function getCellValue(cell, defval) {
  let value = cell.value;
  if (value === null || value === undefined) {
    return defval;
  }
  if (typeof value === 'object') {
    if (value.result !== undefined) return value.result;
    if (value.text !== undefined) return value.text;
    if (value instanceof Date) return value;
  }
  return value;
}

function sheetToArrayOfArrays(worksheet, defval = null) {
  const rows = [];
  worksheet.eachRow({ includeEmpty: false }, (row) => {
    const cells = [];
    const count = row.cellCount;
    for (let i = 1; i <= count; i++) {
      cells.push(getCellValue(row.getCell(i), defval));
    }
    rows.push(cells);
  });
  return rows;
}

function getSheetNames(workbook) {
  return workbook.worksheets.map(ws => ws.name);
}

function getSheet(workbook, name) {
  return workbook.getWorksheet(name);
}

module.exports = {
  readWorkbookFromBuffer,
  readCsvFromBuffer,
  sheetToArrayOfArrays,
  getSheetNames,
  getSheet
};
