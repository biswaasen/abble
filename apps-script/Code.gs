const SECRET = 'PASTE_SECRET';
const TAB = 'Early list';
const HEADERS = ['Time', 'Name', 'Email', 'Phone', 'You are a', 'Role and company', 'Agents', 'Hours a day with agents', 'Away from the screen', 'OK to call', 'Country', 'Page', 'Browser'];

function doPost(e) {
  let body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return reply({ ok: false, error: 'bad json' });
  }
  if (!SECRET || SECRET === 'PASTE_SECRET' || body.secret !== SECRET) return reply({ ok: false, error: 'unauthorized' });
  if (!body.email) return reply({ ok: false, error: 'missing email' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = tab();
    sheet.appendRow([
      new Date(),
      safe(body.name),
      safe(body.email),
      safe(body.phone),
      safe(body.role),
      safe(body.company),
      safe((body.agents || []).join(', ')),
      safe(body.hours),
      safe(body.away),
      body.okToCall ? 'Yes' : 'No',
      safe(body.country),
      safe(body.page),
      safe(body.browser),
    ]);
  } finally {
    lock.releaseLock();
  }
  return reply({ ok: true });
}

function doGet() {
  return reply({ ok: true, service: 'abble early list' });
}

function setup() {
  tab();
}

function tab() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(TAB);
  if (!sheet) sheet = ss.insertSheet(TAB, 0);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
  }
  return sheet;
}

function safe(v) {
  const s = String(v == null ? '' : v).slice(0, 500);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
