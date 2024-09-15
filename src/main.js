require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { getUsdtBalance, getAccountInfo } = require('./tronHelper');
const { appendDataToSheet } = require('./googleSheetsHelper');
const {
  initDatabase,
  checkTransactionExists,
  saveTransaction,
  isTransactionProcessed,
  markTransactionProcessed,
  getLastTransactionsFromDatabase,
} = require('./database');

const { deleteOldTransactions } = require('./cleanup'); 
const cron = require('node-cron'); 
const TelegramNotifier = require('./telegramNotifier');
const telegramToken = process.env.TELEGRAM_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;
const telegramNotifier = new TelegramNotifier(telegramToken, telegramChatId);

const walletAddress = process.env.WALLETADRESS;
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAMES = [
  'ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ',
  'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'
];
const INTERVAL_DELAY = 30000; // 30 секунд
const MIN_USDT_AMOUNT = 1; // Минимальная сумма в USDT для обработки транзакции

function logToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  fs.appendFileSync('app.log', logMessage);
}

async function getLastTransactions() {
  try {
    const response = await axios.get(`https://api.trongrid.io/v1/accounts/${walletAddress}/transactions/trc20`);
    const transactions = response.data.data;

    if (transactions.length === 0) {
      console.log('No new transactions found');
      return;
    }

    // Сортируем транзакции по убыванию даты
    transactions.sort((a, b) => new Date(b.block_timestamp) - new Date(a.block_timestamp));

    for (const transaction of transactions) {
      const symbol = transaction.token_info.symbol;
      if (symbol !== 'USDT') {
        continue;
      }

      const transactionId = transaction.transaction_id;
      const fromAddress = transaction.from;
      const toAddress = transaction.to;
      const type = transaction.type;
      const value = transaction.value / 1000000;
      const timestamp = new Date(transaction.block_timestamp).toLocaleString();

      const isTransactionExists = await checkTransactionExists(transactionId);

      if (!isTransactionExists && type !== 'Approval') {
        await saveTransaction(transactionId, fromAddress, toAddress, value, timestamp);
        console.log(`New transaction saved: ${transactionId}`);
        logToFile(`New transaction saved: ${transactionId}`);
      }
    }
  } catch (error) {
    console.error('Error fetching transactions:', error);
    logToFile(`Error fetching transactions: ${JSON.stringify(error)}`);
  }
}

async function processTransactions() {
  try {
    const balance = await getUsdtBalance(walletAddress);
    console.log(`USDT баланс кошелька ${walletAddress}: ${balance}`);
    // logToFile(`USDT баланс кошелька ${walletAddress}: ${balance}`);

    const accountInfo = await getAccountInfo(walletAddress);
    console.log(`Информация о счете ${walletAddress}:`, accountInfo);
    // logToFile(`Информация о счете ${walletAddress}: ${JSON.stringify(accountInfo)}`);

    const lastTransactions = await getLastTransactionsFromDatabase(MIN_USDT_AMOUNT);

    for (const transaction of lastTransactions) {
      const { transaction_id, from_address, to_address, value, timestamp } = transaction;
      const transactionId = transaction_id;
      const fromAddress = from_address;
      const toAddress = to_address;

      const isProcessed = await isTransactionProcessed(transactionId);

      if (!isProcessed && value >= MIN_USDT_AMOUNT) {
        logToFile(`Проверка адресов: fromAddress = ${fromAddress}, toAddress = ${toAddress}`);

        if (fromAddress === walletAddress || toAddress === walletAddress) {
          const timestampWithOffset = new Date(timestamp).getTime() + (60 * 60 * 1000);
          const formattedDate = new Date(timestampWithOffset).toLocaleDateString();
          const formattedTime = new Date(timestampWithOffset).toLocaleTimeString();
          const formattedDayOfWeek = new Date(timestampWithOffset).toLocaleDateString('ru-RU', { weekday: 'long' });

          let incomeAmount = '';
          let expenseAmount = '';
          let recipientAddress = '';

          if (toAddress === walletAddress) {
            incomeAmount = value.toString();
            await telegramNotifier.sendTransactionNotification(incomeAmount, '', balance);
          } else if (fromAddress === walletAddress) {
            expenseAmount = value.toString();
            recipientAddress = toAddress;
            await telegramNotifier.sendTransactionNotification('', expenseAmount, balance);
          }

          const transactionData = {
            date: formattedDate,
            dayOfWeek: formattedDayOfWeek,
            time: formattedTime,
            comment: '',
            incomeAmount,
            expenseAmount,
            recipientAddress,
            balance: balance.toString(),
          };

          console.log('Новая транзакция USDT:', transactionData);
          logToFile(`Новая транзакция USDT: ${JSON.stringify(transactionData)}`);

          try {
            const sheetName = SHEET_NAMES[new Date(timestamp).getMonth()];
            logToFile(`Вызов функции appendDataToSheet с параметрами: sheetName = ${sheetName}, transaction = ${JSON.stringify(transactionData)}`);

            await appendDataToSheet(SPREADSHEET_ID, `${sheetName}!A:H`, [
              transactionData.date,
              transactionData.dayOfWeek,
              transactionData.time,
              transactionData.comment,
              incomeAmount,
              expenseAmount,
              recipientAddress,
              transactionData.balance,
            ]);

            logToFile(`Транзакция успешно записана в таблицу Google Sheets (лист: ${sheetName})`);
            await markTransactionProcessed(transactionId);
          } catch (error) {
            console.error('Ошибка при записи транзакции в таблицу Google Sheets:', error);
            logToFile(`Ошибка при записи транзакции в таблицу Google Sheets: ${JSON.stringify(error)}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('Ошибка в основной функции:', error);
    logToFile(`Ошибка в основной функции: ${JSON.stringify(error)}`);
  }
}

function startProcessing() {
  initDatabase();
  setInterval(getLastTransactions, INTERVAL_DELAY);
  setInterval(processTransactions, INTERVAL_DELAY);
  cron.schedule('0 3 * * 0', () => deleteOldTransactions()); // Каждое воскресенье в 3:00 удаляем старые записи
}

startProcessing();