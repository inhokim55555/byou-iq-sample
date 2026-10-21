import { unzipSync } from './vendor/fflate.browser.js';

const MAX_COMPRESSED_BYTES = 20 * 1024 * 1024;
const MAX_EXPANDED_BYTES = 100 * 1024 * 1024;
const MAX_ZIP_ENTRIES = 500;
const MAX_DATA_ROWS = 5000;

export const SHIPMENT_IMPORT_FIELDS = Object.freeze({
  campaignName: { label: 'Campaign', aliases: ['campaign', 'campaign name', 'brand campaign'], max: 300, identity: true },
  creatorLink: { label: 'Creator Link', aliases: ['creator link', 'creator profile link', 'creator url', 'profile link', 'profile url', 'social link', 'instagram link', 'tiktok link'], max: 500, identity: true },
  shipmentType: { label: 'Seeding / Paid', aliases: ['seeding paid', 'seeding/paid', 'shipment type', 'type'], enum: ['seeding', 'paid'] },
  pic: { label: 'PIC', aliases: ['pic', 'person in charge', 'owner'], enum: ['Alex Sample', 'Blair Sample', 'Casey Sample', 'Drew Sample', 'Ellis Sample'] },
  fullName: { label: 'Recipient Name', aliases: ['recipient name', 'recipient', 'full name', 'name'], max: 200 },
  address: { label: 'Address', aliases: ['address', 'shipping address', 'recipient address'], max: 1200 },
  productName: { label: 'Product', aliases: ['product', 'product name', 'item'], max: 200 },
  brand: { label: 'Brand', aliases: ['brand', 'brand name'], max: 200 },
  boxSize: { label: 'Box Size', aliases: ['box size', 'package size', 'box dimensions'], max: 80 },
  shippingCost: { label: 'Shipping Cost', aliases: ['shipping cost', 'shipping price', 'postage', 'cost'], amount: true },
  trackingOriginal: { label: 'Tracking Original', aliases: ['tracking original', 'original tracking', 'tracking (original)'], max: 120, tracking: true },
  trackingNumber: { label: 'Tracking Number', aliases: ['tracking number', 'tracking no', 'tracking #', 'tracking', 'tracking id'], max: 120, tracking: true },
  packingDate: { label: 'Packing Date', aliases: ['packing date', 'packed date', 'pack date'], date: true },
  notes: { label: 'Notes', aliases: ['notes', 'note', 'shipment notes'], max: 2000 }
});

const normalizeHeader = value => String(value ?? '').trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const aliases = new Map(Object.entries(SHIPMENT_IMPORT_FIELDS).flatMap(([field, config]) =>
  [config.label, ...config.aliases].map(alias => [normalizeHeader(alias), field])));
const local = (node, name) => [...(node?.getElementsByTagNameNS?.('*', name) || [])];
const issue = (code, message, field = null) => ({ code, message, ...(field ? { field } : {}) });

function checkZipDirectory(bytes) {
  if (bytes.byteLength > MAX_COMPRESSED_BYTES) throw new Error('Choose an XLSX file smaller than 20 MB.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const min = Math.max(0, bytes.byteLength - 65_557);
  let eocd = -1;
  for (let i = bytes.byteLength - 22; i >= min; i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('This file is not a readable XLSX workbook.');
  const count = view.getUint16(eocd + 10, true);
  const size = view.getUint32(eocd + 12, true);
  const offset = view.getUint32(eocd + 16, true);
  if (count === 0xffff || size === 0xffffffff || offset === 0xffffffff || count > MAX_ZIP_ENTRIES || offset + size > eocd) {
    throw new Error('This workbook uses an unsupported or unusually large ZIP format.');
  }
  let cursor = offset, expanded = 0;
  for (let index = 0; index < count; index++) {
    if (cursor + 46 > offset + size || view.getUint32(cursor, true) !== 0x02014b50) throw new Error('This workbook has a damaged ZIP directory.');
    const compressed = view.getUint32(cursor + 20, true);
    const uncompressed = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    if (compressed === 0xffffffff || uncompressed === 0xffffffff) throw new Error('This workbook uses an unsupported ZIP64 format.');
    expanded += uncompressed;
    if (expanded > MAX_EXPANDED_BYTES) throw new Error('This workbook expands beyond the 100 MB import limit.');
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  if (cursor > offset + size) throw new Error('This workbook has a damaged ZIP directory.');
}

function xmlDocument(bytes, path) {
  const source = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  const document = new DOMParser().parseFromString(source, 'application/xml');
  if (document.querySelector('parsererror')) throw new Error(`The workbook contains invalid XML in ${path}.`);
  return document;
}

function safeTarget(target) {
  const clean = String(target || '').replaceAll('\\', '/').replace(/^\//, '');
  const parts = [];
  for (const part of clean.startsWith('xl/') ? clean.split('/') : `xl/${clean}`.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') { if (!parts.length) throw new Error('The workbook contains an invalid worksheet path.'); parts.pop(); }
    else parts.push(part);
  }
  return parts.join('/');
}

function styleInfo(stylesXml) {
  if (!stylesXml) return { dateStyles: new Set(), formats: [] };
  const custom = new Map();
  for (const fmt of local(stylesXml, 'numFmt')) custom.set(Number(fmt.getAttribute('numFmtId')), fmt.getAttribute('formatCode') || '');
  const builtIn = new Set([14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 50, 51, 52, 53, 54, 55, 56, 57, 58]);
  const xfs = local(stylesXml, 'cellXfs')[0];
  if (!xfs) return { dateStyles: new Set(), formats: [] };
  const formats=local(xfs, 'xf').map(xf=>custom.get(Number(xf.getAttribute('numFmtId')||0))||'');
  const dateStyles=new Set(local(xfs, 'xf').flatMap((xf, index) => {
    const id = Number(xf.getAttribute('numFmtId') || 0);
    const format = (custom.get(id) || '').replace(/"[^"]*"|\\.|\[[^\]]*\]/g, '').toLocaleLowerCase();
    return builtIn.has(id) || /[ymd]/.test(format) ? [index] : [];
  }));
  return {dateStyles,formats};
}

function excelDate(serial, date1904) {
  if (!Number.isFinite(serial) || serial < 0 || serial > 2_958_465) return null;
  const wholeDays = Math.floor(serial);
  const epoch = date1904 ? Date.UTC(1904, 0, 1) : Date.UTC(1899, 11, wholeDays < 60 ? 31 : 30);
  const date = new Date(epoch + wholeDays * 86_400_000);
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 10) : null;
}

function columnIndex(reference) {
  const letters = String(reference || '').match(/^[A-Z]+/i)?.[0]?.toUpperCase();
  if (!letters) return -1;
  let value = 0;
  for (const char of letters) value = value * 26 + char.charCodeAt(0) - 64;
  return value - 1;
}

function sharedStringValues(xml) {
  if (!xml) return [];
  return local(xml, 'si').map(item => local(item, 't').map(node => node.textContent || '').join(''));
}

function readCell(cell, shared, styles, date1904) {
  const type = cell.getAttribute('t') || '';
  const valueNode = local(cell, 'v')[0];
  const formula = local(cell, 'f').length > 0;
  let value = valueNode?.textContent ?? '';
  if (type === 's') value = shared[Number(value)] ?? '';
  else if (type === 'inlineStr') value = local(cell, 't').map(node => node.textContent || '').join('');
  else if (type === 'b') value = value === '1' ? 'TRUE' : 'FALSE';
  else if (type === 'e') return { value: '', meta: { type, formula }, issue: issue('cell-error', 'This cell contains an Excel error.') };
  else if (!type || type === 'n') {
    const style = Number(cell.getAttribute('s') || 0);
    if (styles.dateStyles.has(style) && value !== '') {
      const normalized = excelDate(Number(value), date1904);
      if (!normalized) return { value: String(value), meta: { type: 'date', formula }, issue: issue('invalid-date', 'The spreadsheet date is outside the supported range.', 'packingDate') };
      return { value: normalized, meta: { type: 'date', formula, date: normalized } };
    }
    const format=styles.formats[style]||'';
    const zeroMask=/^0{2,}$/.test(format);
    if (zeroMask && /^\d+$/.test(value)) value = value.padStart(format.length, '0');
    return { value: String(value), meta: { type: type || 'text', formula, numeric: value !== '', padded: zeroMask } };
  }
  return { value: String(value), meta: { type: type || 'text', formula, ...(type === 'n' || !type ? { numeric: value !== '' } : {}) } };
}

function parseSheet(xml, shared, styles, date1904, name) {
  const styleData = styleInfo(styles);
  const rows = [];
  for (const row of local(xml, 'row')) {
    const rowNumber = Number(row.getAttribute('r')) || rows.length + 1;
    const cells = [], meta = {}, issues = [];
    for (const cell of local(row, 'c')) {
      const index = columnIndex(cell.getAttribute('r'));
      if (index < 0 || index > 16_383) continue;
      const result = readCell(cell, shared, styleData, date1904);
      cells[index] = result.value;
      meta[index] = result.meta;
      if (result.issue) issues.push({ ...result.issue, sourceRow: rowNumber });
    }
    if (cells.some(value => String(value ?? '').trim() !== '')) rows.push({ sourceRow: rowNumber, cells, cellMeta: meta, issues, sheet: name });
    if (rows.length > MAX_DATA_ROWS + 20) throw new Error(`Worksheet “${name}” exceeds the 5,000 row import limit.`);
  }
  return rows;
}

function chooseHeaderRow(rows) {
  const scan = rows.slice(0, 20);
  let best = -1, score = 0;
  for (let index = 0; index < scan.length; index++) {
    const recognized = (scan[index].cells || []).reduce((count, value) => count + (aliases.has(normalizeHeader(value)) ? 1 : 0), 0);
    if (recognized > score) { best = index; score = recognized; }
    if (recognized >= 2 && ['campaignName', 'creatorLink'].some(field => (scan[index].cells || []).some(value => aliases.get(normalizeHeader(value)) === field))) return index;
  }
  return score ? best : 0;
}

function inferredHeaderMap(headers) {
  const map = {};
  headers.forEach((value, index) => { const field = aliases.get(normalizeHeader(value)); if (field && !(field in map)) map[field] = index; });
  return map;
}

function normalizedDate(value, meta) {
  if (meta?.type === 'date' && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) return String(value);
  const text = String(value).trim();
  let match = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (match) {
    const [, y, m, d] = match, candidate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    return validDate(candidate) ? candidate : null;
  }
  match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (match) {
    const [, m, d, year] = match, y = year.length === 2 ? `20${year}` : year, candidate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    return validDate(candidate) ? candidate : null;
  }
  return null;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function normalizeProfileLink(value) {
  let text = String(value).trim();
  if (!text) return null;
  if (!/^https?:\/\//i.test(text)) text = `https://${text}`;
  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname.includes('.')) return null;
    url.hostname = url.hostname.toLocaleLowerCase().replace(/^www\./, '');
    url.search = ''; url.hash = '';
    url.pathname = url.pathname.replace(/\/+$/, '') || '/';
    return url.toString().replace(/\/$/, '');
  } catch { return null; }
}

function mapValue(field, raw, meta, sourceRow, issues) {
  const config = SHIPMENT_IMPORT_FIELDS[field];
  const text = String(raw ?? '').trim();
  if (!text) return undefined;
  if (meta?.formula) issues.push(issue('formula-cached-value', 'Formula cells are not calculated; the workbook’s cached value is used.', field));
  if (config.date) {
    const date = normalizedDate(text, meta);
    if (!date) { issues.push(issue('invalid-date', `“${text}” is not a valid packing date.`, field)); return undefined; }
    return date;
  }
  if (config.amount) {
    const amountText = text.replace(/^\$/, '').replaceAll(',', '');
    if (!/^(?:\d+(?:\.\d{1,2})?|\.\d{1,2})$/.test(amountText)) { issues.push(issue('invalid-cost', `“${text}” is not a non-negative amount with at most two decimals.`, field)); return undefined; }
    const amount = Number(amountText);
    if (!Number.isFinite(amount) || amount > 1_000_000_000) { issues.push(issue('invalid-cost', 'The shipping cost is outside the supported range.', field)); return undefined; }
    return amount;
  }
  if (config.enum) {
    const match = config.enum.find(item => item.toLocaleLowerCase() === text.toLocaleLowerCase());
    if (!match) { issues.push(issue('invalid-choice', `Choose a supported ${config.label.toLocaleLowerCase()} value.`, field)); return undefined; }
    return match;
  }
  if (config.identity && text.length > config.max) { issues.push(issue('too-long', `${config.label} is limited to ${config.max} characters.`, field)); return undefined; }
  if (config.identity && field === 'creatorLink') {
    const link = normalizeProfileLink(text);
    if (!link) { issues.push(issue('invalid-link', 'Enter a valid creator profile link.', field)); return undefined; }
    return link;
  }
  if (text.length > config.max) { issues.push(issue('too-long', `${config.label} is limited to ${config.max} characters.`, field)); return undefined; }
  if (config.tracking && meta?.numeric && (!meta.padded || Number(text) > Number.MAX_SAFE_INTEGER || /[.e]/i.test(text))) {
    issues.push(issue('numeric-tracking', 'This tracking value was stored as a number; check it for lost leading zeroes or rounded digits.', field));
  }
  return text;
}

export function mapShipmentWorkbookRows(rows, headerMap = {}) {
  const mapping = { ...headerMap };
  return (Array.isArray(rows) ? rows : []).map(row => {
    const values = {}, issues = [...(row.issues || [])];
    for (const [field, index] of Object.entries(mapping)) {
      if (!SHIPMENT_IMPORT_FIELDS[field] || index === '' || index === null || index === undefined || !Number.isInteger(Number(index))) continue;
      const value = mapValue(field, row.cells?.[Number(index)], row.cellMeta?.[Number(index)], row.sourceRow, issues);
      if (value !== undefined) values[field] = value;
    }
    for (const field of ['campaignName', 'creatorLink']) {
      if (!values[field]) issues.push(issue('missing-identity', `${SHIPMENT_IMPORT_FIELDS[field].label} is needed to match this row to the CRM.`, field));
    }
    for (const [field, meta] of Object.entries(row.cellMeta || {})) {
      if (meta?.numeric && !mappingHasIndex(mapping, Number(field)) && row.headers?.[Number(field)] && /tracking/i.test(row.headers[Number(field)])) {
        issues.push(issue('numeric-tracking', 'This tracking value may have lost leading zeroes or rounded digits.', 'trackingNumber'));
      }
    }
    return { sourceRow: row.sourceRow, sheet: row.sheet, headers: [...(row.headers || [])], rawCells: [...(row.cells || [])], values, issues };
  });
}

function mappingHasIndex(mapping, index) { return Object.values(mapping).some(value => Number(value) === index); }

export async function readShipmentWorkbook(file) {
  throw new Error('File imports are disabled in the public sample.');
  if (!file || !/\.xlsx$/i.test(file.name || '')) {
    throw new Error('Choose an .xlsx workbook. Other spreadsheet and CSV formats are not supported.');
  }
  if (file.size > MAX_COMPRESSED_BYTES) throw new Error('Choose an XLSX file smaller than 20 MB.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  checkZipDirectory(bytes);
  const archive = unzipSync(bytes);
  if(archive['xl/vbaProject.bin'])throw new Error('Macro-enabled workbooks are not supported. Save a macro-free .xlsx file and try again.');
  const workbookPath = 'xl/workbook.xml';
  if (!archive[workbookPath] || !archive['xl/_rels/workbook.xml.rels']) throw new Error('This file does not contain a valid XLSX workbook.');
  const workbook = xmlDocument(archive[workbookPath], workbookPath);
  const rels = xmlDocument(archive['xl/_rels/workbook.xml.rels'], 'xl/_rels/workbook.xml.rels');
  const relationships = new Map(local(rels, 'Relationship').map(item => [item.getAttribute('Id'), item.getAttribute('Target')]));
  const shared = sharedStringValues(archive['xl/sharedStrings.xml'] ? xmlDocument(archive['xl/sharedStrings.xml'], 'xl/sharedStrings.xml') : null);
  const styles = archive['xl/styles.xml'] ? xmlDocument(archive['xl/styles.xml'], 'xl/styles.xml') : null;
  const date1904 = local(workbook, 'workbookPr')[0]?.getAttribute('date1904') === '1';
  const sheets = [], rowsBySheet = {}, rawRowsBySheet = {}, headersBySheet = {}, headerMapsBySheet = {};
  for (const sheet of local(workbook, 'sheet')) {
    const name = sheet.getAttribute('name') || `Sheet ${sheets.length + 1}`;
    const relation = [...sheet.attributes].find(attribute => attribute.localName === 'id')?.value;
    const target = relationships.get(relation);
    if (!target) continue;
    const path = safeTarget(target), sheetBytes = archive[path];
    if (!sheetBytes) continue;
    const raw = parseSheet(xmlDocument(sheetBytes, path), shared, styles, date1904, name);
    if (!raw.length) continue;
    const headerIndex = chooseHeaderRow(raw), headerRow = raw[headerIndex];
    const headers = (headerRow?.cells || []).map(value => String(value ?? '').trim());
    const dataRows = raw.slice(headerIndex + 1).map(row => ({ ...row, headers }));
    const headerMap = inferredHeaderMap(headers);
    sheets.push(name);
    rawRowsBySheet[name] = dataRows;
    headersBySheet[name] = headers;
    headerMapsBySheet[name] = headerMap;
    rowsBySheet[name] = mapShipmentWorkbookRows(dataRows, headerMap);
  }
  if (!sheets.length) throw new Error('The workbook has no non-empty worksheets to import.');
  return { sheets, rowsBySheet, rawRowsBySheet, headersBySheet, headerMapsBySheet };
}

