const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('transactions.db');

function initDatabase() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS transactions (
      transaction_id TEXT PRIMARY KEY,
      from_address TEXT,
      to_address TEXT,
      value REAL,
      timestamp TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS processed_transactions (
      transaction_id TEXT PRIMARY KEY
    )`);
  });
}

async function checkTransactionExists(transactionId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM transactions WHERE transaction_id = ?', [transactionId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row !== undefined);
      }
    });
  });
}

async function saveTransaction(transactionId, fromAddress, toAddress, value, timestamp) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO transactions (transaction_id, from_address, to_address, value, timestamp) VALUES (?, ?, ?, ?, ?)', [transactionId, fromAddress, toAddress, value, timestamp], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function isTransactionProcessed(transactionId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM processed_transactions WHERE transaction_id = ?', [transactionId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row !== undefined);
      }
    });
  });
}

async function markTransactionProcessed(transactionId) {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO processed_transactions (transaction_id) VALUES (?)', [transactionId], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function getLastTransactionsFromDatabase(minUsdtAmount) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM transactions WHERE value >= ? ORDER BY timestamp DESC', [minUsdtAmount], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  initDatabase,
  checkTransactionExists,
  saveTransaction,
  isTransactionProcessed,
  markTransactionProcessed,
  getLastTransactionsFromDatabase,
};