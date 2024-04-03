
const { Composer } = require("grammy");
const bot = new Composer();

const { createConversation } = require("@grammyjs/conversations");

const { isAdmin } = require("../middleware/middleware");

const { AdminPanel, BotStatistics, UserDetails, CommandGuide, BanUnban, CustomMessage, Channels, AddChannel, NewChannel, RemoveChannel, DeleteChannel } = require("../handler/adminhandler/adminhandler");

bot.use(createConversation(NewChannel));
bot.use(createConversation(DeleteChannel));

bot.chatType("private").hears(["/AdminPanel", "/Admin"], isAdmin, AdminPanel);

bot.chatType("private").callbackQuery("AdminPanel", isAdmin, AdminPanel);

bot.chatType("private").callbackQuery("BotStatistics", isAdmin, BotStatistics);

bot.chatType("private").hears(/^\/userinfo [0-9]+/g, isAdmin, UserDetails);

bot.chatType("private").callbackQuery("CommandGuide", isAdmin, CommandGuide);

bot.chatType("private").hears(/^\/(ban|unban) [0-9]+ \[(.*?)\] (-g|-w)/g, isAdmin, BanUnban);

bot.chatType("private").hears(/^\/msg [0-9]+ \[(.*?)\]/g, isAdmin, CustomMessage);

bot.chatType("private").callbackQuery("Channels", isAdmin, Channels);

bot.chatType("private").callbackQuery("AddChannel", isAdmin, AddChannel);

bot.chatType("private").callbackQuery("RemoveChannel", isAdmin, RemoveChannel);

module.exports = bot;