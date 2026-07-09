require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_ID;

const users = {};

bot.start((ctx) => {
  const userId = ctx.from.id;

  users[userId] = {
    step: "lang",
    lang: "",
    address: "",
    phone: "",
    water: "",
  };

  ctx.reply(
    "Tilni tanlang:\nВыберите язык:",
    Markup.keyboard([["🇺🇿 Uzbek", "🇷🇺 Русский"]]).resize()
  );
});

bot.on("text", async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;

  if (!users[userId]) {
    users[userId] = { step: "lang" };
  }

  const user = users[userId];

  if (user.step === "lang") {
    if (text === "🇺🇿 Uzbek") {
      user.lang = "uz";
      user.step = "address";
      return ctx.reply("📍 Manzilingizni yozing:", Markup.removeKeyboard());
    }

    if (text === "🇷🇺 Русский") {
      user.lang = "ru";
      user.step = "address";
      return ctx.reply("📍 Напишите ваш адрес:", Markup.removeKeyboard());
    }

    return ctx.reply("Tugmadan tilni tanlang.");
  }

  if (user.step === "address") {
    user.address = text;
    user.step = "phone";

    return ctx.reply(
      user.lang === "uz"
        ? "📞 Telefon raqamingizni yozing:\nMasalan: +998901234567"
        : "📞 Напишите номер телефона:\nНапример: +998901234567"
    );
  }

  if (user.step === "phone") {
    user.phone = text;
    user.step = "water";

    return ctx.reply(
      user.lang === "uz"
        ? "💧 Nechta suv olasiz?\nMasalan: 12"
        : "💧 Сколько воды хотите?\nНапример: 12"
    );
  }

  if (user.step === "water") {
    user.water = text;

    const orderText = `
📦 YANGI BUYURTMA

📍 Manzil: ${user.address}
📞 Raqami: ${user.phone}
💧 Suv soni: ${user.water} ta

👤 Mijoz: ${ctx.from.first_name || "Noma'lum"}
🆔 Telegram ID: ${userId}
`;

    await bot.telegram.sendMessage(ADMIN_ID, orderText);

    await ctx.reply(
      user.lang === "uz"
        ? "✅ Buyurtmangiz qabul qilindi."
        : "✅ Ваш заказ принят."
    );

    delete users[userId];
  }
});

bot.launch();
console.log("Zakaz bot ishga tushdi...");