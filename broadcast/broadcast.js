
const { Composer } = require("grammy");
const bot = new Composer();

const { createConversation } = require("@grammyjs/conversations");

const { isAdmin } = require("../middleware/middleware");

const { StartTimexHandler, StopTimexHandler, StartBroadcast, StopBroadcast, PendingBroadcast, RemoveBroadcast, BroadcastPanel, NewBroadCast, NewBroadCastType } = require("../handler/broadcasthandler/broadcasthandler");

bot.use(createConversation(NewBroadCastType));

bot.chatType("private").callbackQuery("BroadcastPanel", isAdmin, BroadcastPanel);

bot.chatType("private").callbackQuery("NewBroadCast", isAdmin, NewBroadCast);

bot.chatType("private").callbackQuery("StartTimex", isAdmin, StartTimexHandler);

bot.chatType("private").callbackQuery("StopTimex", isAdmin, StopTimexHandler);

bot.chatType("private").callbackQuery("StartBroadcast", isAdmin, StartBroadcast);

bot.chatType("private").callbackQuery("StopBroadcast", isAdmin, StopBroadcast);

bot.chatType("private").callbackQuery("PendingBroadcast", isAdmin, PendingBroadcast);

bot.chatType("private").callbackQuery("RemoveBroadcast", isAdmin, RemoveBroadcast);

module.exports = bot
