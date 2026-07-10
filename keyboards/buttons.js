const { Markup } = require("telegraf");

function languageKeyboard() {
  return Markup.keyboard([
    ["🇺🇿 Uzbek", "🇷🇺 Русский"],
  ]).resize();
}

function orderStatusKeyboard(orderId) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "✅ Qabul qilindi",
        `status:accepted:${orderId}`
      ),
    ],
    [
      Markup.button.callback(
        "🚚 Yo‘lda",
        `status:delivery:${orderId}`
      ),
    ],
    [
      Markup.button.callback(
        "✔️ Yetkazildi",
        `status:delivered:${orderId}`
      ),
    ],
    [
      Markup.button.callback(
        "❌ Bekor qilindi",
        `status:cancelled:${orderId}`
      ),
    ],
  ]);
}

module.exports = {
  languageKeyboard,
  orderStatusKeyboard,
};