
const { Composer } = require("grammy");
const bot = new Composer();

const { BonusHandler } = require("../../handler/bonushandler/bonushandler");

bot.chatType("private").hears("🎁 Bonus", BonusHandler);

module.exports = bot;