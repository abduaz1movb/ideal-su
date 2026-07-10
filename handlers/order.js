const { Markup } = require("telegraf");
const { saveCustomer } = require("../database/customers");
const {
  createOrder,
  getOrder,
  updateOrderStatus,
} = require("../database/orders");

const { orderStatusKeyboard } = require("../keyboards/buttons");
const {
  normalizePhone,
  normalizeWaterCount,
  customerName,
} = require("../utils/helper");

function registerOrderHandler(bot, sessions, adminId) {
  bot.on("text", async (ctx) => {
    const userId = ctx.from.id;
    const text = ctx.message.text.trim();
    const session = sessions[userId];

    if (!session) {
      return ctx.reply("Buyurtma berish uchun /start ni bosing.");
    }

    try {
      // Til tanlash
      if (session.step === "language") {
        if (text === "🇺🇿 Uzbek") {
          session.language = "uz";
          session.step = "address";

          return ctx.reply(
            "📍 Manzilingizni yozing:",
            Markup.removeKeyboard()
          );
        }

        if (text === "🇷🇺 Русский") {
          session.language = "ru";
          session.step = "address";

          return ctx.reply(
            "📍 Напишите ваш адрес:",
            Markup.removeKeyboard()
          );
        }

        return ctx.reply("Tilni pastdagi tugmalardan tanlang.");
      }

      // Manzil
      if (session.step === "address") {
        if (text.length < 3) {
          return ctx.reply("Manzilni to‘liqroq yozing.");
        }

        session.address = text;
        session.step = "phone";

        return ctx.reply(
          session.language === "ru"
            ? "📞 Напишите номер телефона:\nНапример: +998901234567"
            : "📞 Telefon raqamingizni yozing:\nMasalan: +998901234567"
        );
      }

      // Telefon
      if (session.step === "phone") {
        const phone = normalizePhone(text);

        if (!/^\+?998\d{9}$/.test(phone)) {
          return ctx.reply(
            session.language === "ru"
              ? "Номер неверный. Например: +998901234567"
              : "Raqam noto‘g‘ri. Masalan: +998901234567"
          );
        }

        session.phone = phone.startsWith("+") ? phone : `+${phone}`;
        session.step = "water";

        return ctx.reply(
          session.language === "ru"
            ? "💧 Сколько бутылей воды хотите?\nНапример: 3"
            : "💧 Nechta suv olasiz?\nMasalan: 3"
        );
      }

      // Suv soni
      if (session.step === "water") {
        const waterCount = normalizeWaterCount(text);

        if (!waterCount) {
          return ctx.reply(
            session.language === "ru"
              ? "Введите число от 1 до 100."
              : "1 dan 100 gacha son yozing."
          );
        }

        session.waterCount = waterCount;

        const customer = {
          id: userId,
          fullName: customerName(ctx.from),
          username: ctx.from.username || null,
          phone: session.phone,
          address: session.address,
          language: session.language,
        };

        await saveCustomer(customer);

        const order = await createOrder({
          customerId: userId,
          waterCount,
        });

        const adminMessage = `
📦 YANGI BUYURTMA #${order.id}

👤 Mijoz: ${customer.fullName}
📍 Manzil: ${session.address}
📞 Raqami: ${session.phone}
💧 Suv soni: ${waterCount} ta
🆔 Telegram ID: ${userId}

📌 Holati: Yangi
        `.trim();

        await bot.telegram.sendMessage(
          adminId,
          adminMessage,
          orderStatusKeyboard(order.id)
        );

        await ctx.reply(
          session.language === "ru"
            ? `✅ Ваш заказ №${order.id} принят.`
            : `✅ Buyurtmangiz №${order.id} qabul qilindi.`,
          Markup.removeKeyboard()
        );

        delete sessions[userId];
      }
    } catch (error) {
      console.error("Buyurtma jarayoni xatosi:", error);

      await ctx.reply(
        "❌ Xatolik yuz berdi. Birozdan keyin /start ni bosib qayta urinib ko‘ring."
      );
    }
  });

  // Admin holat tugmalarini bosganda
  bot.action(
    /^status:(accepted|delivery|delivered|cancelled):(\d+)$/,
    async (ctx) => {
      try {
        if (String(ctx.from.id) !== String(adminId)) {
          return ctx.answerCbQuery("Bu tugma faqat admin uchun.");
        }

        const action = ctx.match[1];
        const orderId = Number(ctx.match[2]);

        const statuses = {
          accepted: {
            database: "Qabul qilindi",
            admin: "✅ Qabul qilindi",
            customer: "✅ Buyurtmangiz qabul qilindi.",
          },
          delivery: {
            database: "Yo‘lda",
            admin: "🚚 Yo‘lda",
            customer:
              "🚚 Buyurtmangiz yo‘lda. Iltimos, telefoningiz yoqilgan bo‘lsin.",
          },
          delivered: {
            database: "Yetkazildi",
            admin: "✔️ Yetkazildi",
            customer:
              "✔️ Buyurtmangiz yetkazildi. ideal-su xizmatidan foydalanganingiz uchun rahmat!",
          },
          cancelled: {
            database: "Bekor qilindi",
            admin: "❌ Bekor qilindi",
            customer: "❌ Buyurtmangiz bekor qilindi.",
          },
        };

        const selected = statuses[action];
        const order = await getOrder(orderId);

        await updateOrderStatus(orderId, selected.database);

        await bot.telegram.sendMessage(
          order.customer_id,
          selected.customer
        );

        const oldText = ctx.callbackQuery.message.text;
        const cleanedText = oldText.replace(
          /📌 Holati:.*/,
          `📌 Holati: ${selected.admin}`
        );

        await ctx.editMessageText(
          cleanedText,
          orderStatusKeyboard(orderId)
        );

        await ctx.answerCbQuery("Holat yangilandi");
      } catch (error) {
        console.error("Holat tugmasi xatosi:", error);
        await ctx.answerCbQuery("Xatolik yuz berdi");
      }
    }
  );
}

module.exports = registerOrderHandler;