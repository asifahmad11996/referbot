
const { TryCatchError } = require("../errorhandler/errorhandler");

const { StartKeyboard, CancelKeyboard } = require("../../keyboard/keyboard");

const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const CreateSupportTicket = async (conversation, ctx) => {
    try {
        await ctx.reply(`Enter your request below with details....`, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: {
                keyboard: CancelKeyboard,
                resize_keyboard: true,
                input_field_placeholder: "Enter your request below with details....",
            },
        });

        ctx = await conversation.wait();

        await ctx.reply(`👍 Your ticket has been Created!`, {
            reply_markup: {
                keyboard: StartKeyboard,
                resize_keyboard: true,
            },
        });
        
        await ctx.api.sendMessage(ADMIN_CHAT_ID, `<b>User :</b> <code>${ctx.from.id}</code> Created a ticket!`, {
            parse_mode: "HTML"
        });

        await ctx.api.copyMessage(ADMIN_CHAT_ID, ctx.from.id, ctx.message.message_id, {
            disable_notification: false
        });

    } catch (error) {
        await TryCatchError(error);
    }
};

const TicketHandler = async (ctx) => {
    try {
        await ctx.conversation.enter("CreateSupportTicket");
    } catch (error) {
        await TryCatchError(error);
    }
};

module.exports = { CreateSupportTicket, TicketHandler };