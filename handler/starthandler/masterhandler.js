
const { TryCatchError } = require("../errorhandler/errorhandler");

const { StartMessage } = require("../../message/message");
const { StartKeyboard } = require("../../keyboard/keyboard");

const MasterHandler = async (ctx) => {
    try {
        await ctx.reply(StartMessage, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: {
                keyboard: StartKeyboard,
                resize_keyboard: true
            }
        });
    } catch (error) {
        await TryCatchError(error);
    }
};

module.exports = { MasterHandler };