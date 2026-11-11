import 'dotenv/config';
import { bot } from './bot.js';

bot.catch((err) => {
  console.error('Ошибка в боте:', err);
});

bot.start({
  onStart: (botInfo) => {
    console.log(`Бот @${botInfo.username} запущен и готов к работе! 🚀`);
  },
});