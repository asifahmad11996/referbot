
const { Composer } = require("grammy");
const bot = new Composer();

const { createConversation } = require("@grammyjs/conversations");

const { TicketHandler, CreateSupportTicket } = require("../../handler/tickethandler/tickethandler");

bot.use(createConversation(CreateSupportTicket));

bot.chatType("private").hears("📞 Support", TicketHandler);

module.exports = bot;