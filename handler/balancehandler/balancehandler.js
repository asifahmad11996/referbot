
const Userinfo = require("../../database/userinfoSchema");

const { TryCatchError } = require("../errorhandler/errorhandler");

const { BalanceMessage } = require("../../message/message");

const BalanceHandler = async (ctx) => {
    try {
        const user_id = ctx.from.id;
        const data = await Userinfo.findOne({ user_id });
        const message = BalanceMessage(data.main_balance);

        await ctx.reply(message, {
            parse_mode: "HTML",
            disable_web_page_preview: true
        });
    } catch (error) {
        await TryCatchError(error);
    }
};

module.exports = { BalanceHandler };