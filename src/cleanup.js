const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('transactions.db');

const MAX_RECORDS = 50; // Максимальное количество записей для хранения

async function deleteOldTransactions() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) AS count FROM transactions', (err, row) => {
      if (err) {
        reject(err);
      } else {
        const totalRecords = row.count;
        if (totalRecords > MAX_RECORDS) {
          const recordsToDelete = totalRecords - MAX_RECORDS;
          db.run(`DELETE FROM transactions WHERE rowid IN (
            SELECT rowid FROM transactions ORDER BY timestamp ASC LIMIT ?
          )`, [recordsToDelete], (err) => {
            if (err) {
              reject(err);
            } else {
              console.log(`Удалено ${recordsToDelete} старых записей из таблицы transactions.`);
              resolve();
            }
          });
        } else {
          console.log('Количество записей в базе данных не превышает лимит. Удаление не требуется.');
          resolve();
        }
      }
    });
  });
}

deleteOldTransactions();