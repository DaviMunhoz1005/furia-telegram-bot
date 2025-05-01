require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const ADMIN_ID = 7902897006;
const CHAT_ID_TORCIDA = -1002588339041;

console.log("Starting Bot...");