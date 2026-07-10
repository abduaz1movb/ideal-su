require("dotenv").config();

const http = require("http");
const { Telegraf } = require("telegraf");

const registerStartHandler = require("./handlers/start");
const registerOrderHandler = require("./handlers/order");

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_ID = process.env.ADMIN_ID;
const PORT = process.env.PORT || 3000;

const sessions = {};

registerStartHandler(bot, sessions);
registerOrderHandler(bot, sessions, ADMIN_ID);

bot.catch((error) => {
  console.error("Telegram bot xatosi:", error);
});

// Render uchun HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8",
  });

  res.end("ideal-su bot ishlayapti");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`HTTP server ${PORT} portda ishlayapti`);
});

// Telegram botni ishga tushirish
bot
  .launch()
  .then(() => {
    console.log("ideal-su Telegram bot ishga tushdi");
  })
  .catch((error) => {
    console.error("Botni ishga tushirish xatosi:", error);
  });

process.once("SIGINT", () => {
  bot.stop("SIGINT");
  server.close();
});

process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
  server.close();
});