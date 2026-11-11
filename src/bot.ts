import { Bot } from "grammy";
import { analyzeFood } from "./vision.js";
import { formatResult } from "./format.js";

const token = process.env.BOT_TOKEN;
if (!token) throw new Error("BOT_TOKEN не найден в .env");

export const bot = new Bot(token);

bot.command("start", (ctx) =>
  ctx.reply("Пришли фото еды, и я посчитаю калории 📸")
);

bot.on("message:photo", async (ctx) => {
  const status = await ctx.reply("Анализирую фото...");
  
  try {
    const photo = ctx.message.photo.at(-1);
    if (!photo) throw new Error("Нет фото");

    const file = await ctx.api.getFile(photo.file_id);
    if (!file.file_path) throw new Error("Нет пути к файлу");

    const url = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
    const buffer = Buffer.from(await (await fetch(url)).arrayBuffer());

    const data = await analyzeFood(buffer);
    
    await ctx.api.editMessageText(
      ctx.chat.id, 
      status.message_id, 
      formatResult(data)
    );
  } catch (err) {
    console.error("Ошибка при обработке фото:", err);
    await ctx.api.editMessageText(
      ctx.chat.id, 
      status.message_id, 
      "Не получилось распознать. Попробуй другое фото."
    );
  }
});