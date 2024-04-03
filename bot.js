const { Bot, session } = require("grammy");
const { sequentialize } = require("@grammyjs/runner");
const { conversations } = require("@grammyjs/conversations");

const { constraints, isClicked, isNewUser, isBanned, isSubscribed, ignoreConversation } = require("./middleware/middleware");

const { BotError } = require("./handler/errorhandler/errorhandler");

const token = process.env.BOT_TOKEN || "";

const bot = new Bot(token);

bot.use(sequentialize(constraints));

bot.use(
    session({
        initial: () => ({}),
    })
);

bot.use(conversations());

bot.catch(BotError);

bot.chatType("private").use(isClicked);

bot.chatType("private").use(ignoreConversation);

bot.chatType("private").use(isNewUser);

bot.chatType("private").use(isBanned);

bot.chatType("private").use(isSubscribed);

module.exports = bot;