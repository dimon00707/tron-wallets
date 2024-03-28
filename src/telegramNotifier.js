const TelegramBot = require('node-telegram-bot-api');

class TelegramNotifier {
  constructor(token, chatId) {
    this.bot = new TelegramBot(token, { polling: false });
    this.chatId = chatId;
  }

  async sendTransactionNotification(incomeAmount, expenseAmount, balance) {
    const timestamp = new Date().getTime();
    const timestampWithOffset = timestamp + (60 * 60 * 1000);
    const formattedTime = new Date(timestampWithOffset).toLocaleTimeString();

    let message = '';
    
    if (incomeAmount) {
      message = `🟩 Новая входящая транзакция\nСумма: ${incomeAmount} USDT\nВремя: ${formattedTime}\nТекущий баланс: ${balance} USDT`;
    } else if (expenseAmount) {
      message = `🟥 Новая исходящая транзакция\nСумма: ${expenseAmount} USDT\nВремя: ${formattedTime}\nТекущий баланс: ${balance} USDT`;
    }

    try {
      await this.bot.sendMessage(this.chatId, message, { parse_mode: 'Markdown' });
      console.log('Уведомление отправлено в Telegram');
    } catch (error) {
      console.error('Ошибка при отправке уведомления в Telegram:', error);
    }
  }
}

module.exports = TelegramNotifier;


