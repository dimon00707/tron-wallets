require('dotenv').config();
const TelegramNotifier = require('./telegramNotifier');
const telegramToken = process.env.TELEGRAM_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;
const telegramNotifier = new TelegramNotifier(telegramToken, telegramChatId);

const testTransaction = {
  expenseAmount: 100,
  timestamp: new Date().toISOString(),
};

// Тестовый баланс
const testBalance = 1000;

// Отправляем тестовое уведомление
telegramNotifier.sendTransactionNotification(testTransaction, testBalance)
  .then(() => {
    console.log('Тестовое уведомление отправлено');
  })
  .catch((error) => {
    console.error('Ошибка при отправке тестового уведомления:', error);
  });