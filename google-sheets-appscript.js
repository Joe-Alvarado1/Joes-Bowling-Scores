const SHEET_NAME = 'Scores';

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || '{}');
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error(`Sheet ${SHEET_NAME} not found.`);
  }

  const row = [
    payload.timestamp || new Date().toISOString(),
    payload.total ?? '',
    ...(payload.frames || []),
  ];

  sheet.appendRow(row);

  return ContentService.createTextOutput(JSON.stringify({ ok: true, appended: row.length }));
}
