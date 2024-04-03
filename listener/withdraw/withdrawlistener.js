
const { Composer } = require("grammy");
const bot = new Composer();

const { createConversation } = require("@grammyjs/conversations");

const { WithdrawMiddleware, WithdrawHandler, WithdrawAddress } = require("../../handler/withdrawhandler/withdrawhandler");

bot.use(createConversation(WithdrawAddress))

bot.chatType("private").hears("💵 Withdraw", WithdrawMiddleware, WithdrawHandler);

module.exports = bot;