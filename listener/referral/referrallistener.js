
const { Composer } = require("grammy");
const bot = new Composer();

const { ReferralHandler } = require("../../handler/referralhandler/referralhandler");

bot.chatType("private").hears("👭 Referrals", ReferralHandler);

module.exports = bot;