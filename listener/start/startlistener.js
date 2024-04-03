
const { Composer } = require("grammy");
const bot = new Composer();

const { StartHandler } = require("../../handler/starthandler/starthandler");

bot.chatType("private").hears(/^\/start (\d+)$/, StartHandler);

bot.chatType("private").hears("/start", StartHandler);

module.exports = bot;