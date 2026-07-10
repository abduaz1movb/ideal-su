const { languageKeyboard } = require("../keyboards/buttons");

function registerStartHandler(bot, sessions) {
  bot.start(async (ctx) => {
    const userId = ctx.from.id;

    sessions[userId] = {
      step: "language",
      language: null,
      address: null,
      phone: null,
      waterCount: null,
    };

    await ctx.reply(
      "💧 ideal-su\n\nTilni tanlang:\nВыберите язык:",
      languageKeyboard()
    );
  });
}

module.exports = registerStartHandler;