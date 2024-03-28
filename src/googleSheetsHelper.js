const { google } = require('googleapis');
const { GOOGLE_API_KEY_FILE } = require('./config');

const auth = new google.auth.GoogleAuth({
  keyFile: GOOGLE_API_KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

async function appendDataToSheet(spreadsheetId, range, data) {
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [data],
      },
    });
    console.log('Данные успешно добавлены в таблицу.');
  } catch (error) {
    console.error('Ошибка при добавлении данных в таблицу:', error);
    throw error;
  }
}

module.exports = {
  appendDataToSheet,
};


