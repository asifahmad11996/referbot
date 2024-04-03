
const { Composer } = require("grammy");
const bot = new Composer();

const { MasterHandler } = require("../../handler/starthandler/masterhandler");

bot.chatType("private").on("message", MasterHandler)

module.exports = bot;