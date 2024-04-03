
const { Composer } = require("grammy");
const bot = new Composer();

const { BalanceHandler } = require("../../handler/balancehandler/balancehandler");

bot.chatType("private").hears("💰 Balance", BalanceHandler);

module.exports = bot;