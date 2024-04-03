
const Userinfo = require("../../database/userinfoSchema");
const Broadcastinfo = require("../../database/broadcastinfoSchema");

const { api } = require("../../bot");

const { TryCatchError } = require("../errorhandler/errorhandler");

const { StartKeyboard, CancelKeyboard, FormatKeyboard, BroadcastKeyboard } = require("../../keyboard/keyboard");

let timex;
let rate_limit = 0;
let warning = 1;

const StartTimex = async () => {
    let waitingTime = 50;

    timex = setInterval(async () => {
        await Broadcast();
    }, waitingTime * warning);
};

const StopTimex = async () => {
    clearInterval(timex);
};

const RestartTimex = async function (time) {
    await StopTimex();
    await api.sendMessage(ADMIN_CHAT_ID, `Broadcast Stopped For ${time / 1000} Seconds Due To Rate Limit`);

    setTimeout(async () => {
        await StartTimex();
        await api.sendMessage(ADMIN_CHAT_ID, `Broadcast Restart After ${time / 1000} Seconds!`);
    }, time);
};

const Broadcast = async () => {
    try {
        const query = (rate_limit > 10) ? { type: "text", status: true } : { type: { $ne: "text" }, status: true };

        const data = await Broadcastinfo.findOne(query);

        if (!data) {
            const search = await Broadcastinfo.findOne({ status: true });

            if (!search) return;

            await SendBroadcast(search);
            return;
        }

        await SendBroadcast(data);

    } catch (error) {
        await TryCatchError(error);
    }
};

const SendBroadcast = async (data) => {
    try {
        const { _id, chat_id, from_chat_id, message_id, type } = data;

        const deleted = await Broadcastinfo.deleteOne({ _id });

        if (deleted.deletedCount == 0) return;

        if (type == "forward") {
            await api.forwardMessage(chat_id, from_chat_id, message_id, {
                disable_notification: false
            });
            return;
        }

        rate_limit = rate_limit + 1;

        await api.copyMessage(chat_id, from_chat_id, message_id, {
            disable_notification: false
        });

    } catch (error) {
        if (error && error.code == 429) {
            const { chat_id, from_chat_id, message_id, type, status } = data;

            await Broadcastinfo.create({
                chat_id, from_chat_id, message_id, type, status
            });

            let timeOut = error.parameters.retry_after;
            let wait = Number(timeOut * 2000);
            warning = warning + 1;
            await RestartTimex(wait);
            return;
        }

        if (error && error.code >= 500) {
            const { chat_id, from_chat_id, message_id, type, status } = data;

            await Broadcastinfo.create({
                chat_id, from_chat_id, message_id, type, status
            });
            return;
        }

        if (error?.description == "Bad Request: chat not found") {
            return await Userinfo.updateOne({ user_id }, { $set: { is_blocked: true } });
        }

        await TryCatchError(error);
    }
};

const StartTimexHandler = async (ctx) => {
    try {
        await StartTimex();
        await ctx.editMessageText(`Broadcast started!`, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: BroadcastKeyboard
            }
        });
    } catch (error) {
        await TryCatchError(error);
    }
};

const StopTimexHandler = async (ctx) => {
    try {
        await StopTimex();
        await ctx.editMessageText(`Broadcast stopped!`, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: BroadcastKeyboard
            }
        });
    } catch (error) {
        await TryCatchError(error);
    }
};

const StartBroadcast = async (ctx) => {
    try {
        const updated = await Broadcastinfo.bulkWrite([{ updateMany: { "filter": { "status": false }, "update": { $set: { "status": true } } } }]);

        if (updated) {
            await ctx.editMessageText(`${updated.modifiedCount} Broadcast started!`, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: BroadcastKeyboard
                }
            });
        } else {
            await ctx.editMessageText(`Oh sad! i can not start broadcast!`, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: BroadcastKeyboard
                }
            });
        }
    } catch (error) {
        await TryCatchError(error);
    }
};

const StopBroadcast = async (ctx) => {
    try {
        const updated = await Broadcastinfo.bulkWrite([{ updateMany: { "filter": { "status": true }, "update": { $set: { "status": false } } } }]);

        if (updated) {
            await ctx.editMessageText(`${updated.modifiedCount} Broadcast stopped!`, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: BroadcastKeyboard
                }
            });
        } else {
            await ctx.editMessageText(`Oh sad! i can not stop broadcast!`, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: BroadcastKeyboard
                }
            });
        }
    } catch (error) {
        await TryCatchError(error);
    }
};

const PendingBroadcast = async (ctx) => {
    try {
        const pendingBroadcast = await Broadcastinfo.countDocuments({ status: true });
        const time = Number(pendingBroadcast / (50 * warning));
        const minutes = Number(time / 60);

        const message = `<b>Total Pending Broadcast -</b> ${pendingBroadcast}\n\n<b>Estimate Time -</b> ${minutes.toFixed(2)} <b>Minutes</b>`;

        await ctx.editMessageText(message, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: BroadcastKeyboard
            }
        });

    } catch (error) {
        await TryCatchError(error);
    }
};

const RemoveBroadcast = async (ctx) => {
    try {
        const removed = await Broadcastinfo.bulkWrite([{ deleteMany: { "filter": { "status": true } } }]);

        if (removed) {
            await ctx.editMessageText(`${removed.deletedCount} Pending Broadcast Removed!`, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: BroadcastKeyboard
                }
            });
        } else {
            await ctx.editMessageText(`Oh sad! i can not removed broadcast!`, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: BroadcastKeyboard
                }
            });
        }
    } catch (error) {
        await TryCatchError(error);
    }
};


const StoreBroadcast = async (from_chat_id, message_id, type) => {
    for await (const value of Userinfo.find({ is_blocked: false }, { "_id": 0, "user_id": 1 })) {
        const check = await Broadcastinfo.exists({
            chat_id: value.user_id, from_chat_id, message_id, type
        });

        if (!check) {
            await Broadcastinfo.create({
                chat_id: value.user_id, from_chat_id, message_id, type
            });
        }
    }
};

const BroadcastPanel = async (ctx) => {
    try {
        await ctx.editMessageText(`<b>Welcome on Broadcast!</b>`, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: BroadcastKeyboard
            }
        });
    } catch (error) {
        await TryCatchError(error);
    }
};

const NewBroadCast = async (ctx) => {
    try {
        await ctx.reply(`Send me the message which you want to Broadcast your users :`, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: CancelKeyboard,
                resize_keyboard: true,
                input_field_placeholder: `Enter the post or forward a message....`
            }
        });

        await ctx.conversation.enter("NewBroadCastType");

    } catch (error) {
        await TryCatchError(error);
    }
};

const NewBroadCastType = async (conversation, ctx) => {
    try {
        ctx = await conversation.wait();

        const from_chat_id = ctx.from.id;
        const message_id = ctx.message.message_id;

        await ctx.reply(`Select a type from below :`, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: FormatKeyboard,
                resize_keyboard: true,
                input_field_placeholder: `Select a type from below....`
            }
        });

        await NewBroadCastStart(conversation, ctx, from_chat_id, message_id);

    } catch (error) {
        await TryCatchError(error);
    }
};

const NewBroadCastStart = async (conversation, ctx, from_chat_id, message_id) => {
    try {
        ctx = await conversation.wait();

        const type = ["Send as «Forward» ➠  (▶️ On)", "Send as «Forward» ➠  (⏹ Off)"];

        if (!type.includes(ctx.message.text)) {
            await ctx.reply(`Select a type from below :`, {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: FormatKeyboard,
                    resize_keyboard: true,
                    input_field_placeholder: `Select a type from below....`
                }
            });
            return NewBroadCastStart(conversation, ctx, from_chat_id, message_id);
        }

        const messageType = (ctx.message.text == type[0]) ? "forward" : "text";

        let countMessage = await Userinfo.countDocuments({ is_blocked: false });

        await ctx.reply(`Broadcast has been send to ${countMessage} users!`, {
            reply_markup: {
                keyboard: StartKeyboard,
                resize_keyboard: true
            }
        });

        StoreBroadcast(from_chat_id, message_id, messageType);

    } catch (error) {
        await TryCatchError(error);
    }
};

StartTimex();

module.exports = { StartTimexHandler, StopTimexHandler, StartBroadcast, StopBroadcast, PendingBroadcast, RemoveBroadcast, BroadcastPanel, NewBroadCast, NewBroadCastType };

