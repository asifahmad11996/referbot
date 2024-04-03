require("dotenv").config();

const { run } = require("@grammyjs/runner");

const bot = require("./bot");
const database = require("./database/connect");
const { allowed_updates } = require("./config");
const { ProcessError } = require("./handler/errorhandler/errorhandler");

const admin = require("./admin/admin");
const broadcast = require("./broadcast/broadcast");

const startListener = require("./listener/start/startlistener");

const balanceListener = require("./listener/balance/balancelistener");

const referralListener = require("./listener/referral/referrallistener");

const bonusListener = require("./listener/bonus/bonuslistener");

const supportListener = require("./listener/support/supportlistener");

const withdrawlistener = require("./listener/withdraw/withdrawlistener");

const mastertListener = require("./listener/start/masterlistener");

process.on("uncaughtException", async (error) => {
    await ProcessError(error);
});

process.on("unhandledRejection", async (reason, promise) => {
    let error = { reason, promise };
    await ProcessError(error);
});

bot.chatType("private").use(admin);

bot.chatType("private").use(broadcast);

bot.chatType("private").use(startListener);

bot.chatType("private").use(balanceListener);

bot.chatType("private").use(referralListener);

bot.chatType("private").use(bonusListener);

bot.chatType("private").use(supportListener);

bot.chatType("private").use(withdrawlistener);

bot.chatType("private").use(mastertListener);

database()
    .then(async () => {
        await bot.init();
        run(bot, { runner: { fetch: { allowed_updates: allowed_updates } } });
        console.log(`Bot @${bot.botInfo.username} is running!`);
    })
    .catch((error) => {
        console.error("Error on database connection", error);
        process.exit(1);
    });