
const Userinfo = require("../database/userinfoSchema");
const Subscriptioninfo = require("../database/subscriptioninfoSchema");

const { TryCatchError } = require("../handler/errorhandler/errorhandler");

const { StartKeyboard } = require("../keyboard/keyboard");
const keyboardJson = require("../keyboard.json");

const ADMIN_CHAT_ID = Number(process.env.ADMIN_CHAT_ID);
const ADMINS = [Number(process.env.ADMIN_CHAT_ID), Number(process.env.SECONDARY_ID)];
const REFER_REWARD = process.env.REFER_REWARD;

const constraints = (ctx) => {
    const chat = ctx.chat?.id.toString();
    const user = ctx.from?.id.toString();
    return [chat, user].filter((con) => con !== undefined);
};

const isClicked = async (ctx, next) => {
    try {
        const user_id = ctx.from?.id;

        const is_blocked = false;
        const last_clicked_at = Date.now();

        await Userinfo.updateOne({ user_id }, { $set: { is_blocked, last_clicked_at } });
        await next();
    } catch (error) {
        await TryCatchError(error);
    }
};

const isNewUser = async (ctx, next) => {
    try {
        const user_id = Number(ctx.from?.id);
        const match = Number(ctx.match?.[1]) || Number(ADMIN_CHAT_ID);
        const referred_by = (user_id == match) ? Number(ADMIN_CHAT_ID) : match;

        const isUserExists = await Userinfo.findOne({ user_id });

        if (isUserExists) return await next();

        const data = await Userinfo.create({ user_id, referred_by });

        if (data) return await next();

        await ctx.reply("😔 Something went wrong!", {
            reply_markup: {
                remove_keyboard: true
            }
        });

    } catch (error) {
        await TryCatchError(error);
    }
};

const isBanned = async (ctx, next) => {
    try {
        const user_id = ctx.from?.id;
        const data = await Userinfo.findOne({ user_id: user_id, is_banned: true });

        if (!data) return await next();

        await ctx.reply(`<b>⚠️ You are not banned from this bot!</b>\n\nReason : ${data.ban_reason}`, {
            parse_mode: "HTML",
            reply_markup: {
                remove_keyboard: true
            }
        });

    } catch (error) {
        await TryCatchError(error);
    }
};

const isAdmin = async (ctx, next) => {
    try {
        if (ADMINS.includes(ctx.from.id)) return await next();

        await ctx.reply(`⚠️ You are not allowed to do this!`, {
            reply_markup: {
                remove_keyboard: true
            }
        });

    } catch (error) {
        await TryCatchError(error);
    }
};

const isSubscribed = async (ctx, next) => {
    try {
        const user_id = ctx.from.id;
        let text = `<b>⚠️ In order to use this bot, you must join our</b>\n`;

        const data = await Subscriptioninfo.find({ checking: true });

        if (!data || data.length == 0) return await next();

        for (const iterator of data) {
            text += `\n<a href="${iterator.chat_link}">${iterator.anchor_data}</a>`;
        }

        for (const channel of data) {
            try {
                const getchatmember = await ctx.api.getChatMember(channel.chat_id, user_id);

                if (getchatmember.status == "left") {
                    await ctx.reply(text, {
                        parse_mode: "HTML",
                        disable_web_page_preview: true,
                        reply_markup: {
                            keyboard: [
                                [
                                    { text: "✅ Joined" }
                                ]
                            ],
                            resize_keyboard: true
                        }
                    });
                    return;
                }
            } catch (error) {
                await Subscriptioninfo.findOneAndUpdate({ chat_id: channel.chat_id }, { checking: false });
            }
        }

        const user = await Userinfo.findOne({ user_id });

        if (!user.is_subscribed) {
            await Userinfo.findOneAndUpdate({ user_id }, { is_subscribed: true });
            await Userinfo.findOneAndUpdate({ user_id : user.referred_by }, { $inc : { main_balance: REFER_REWARD }});
        }

        await next();

    } catch (error) {
        await TryCatchError(error);
    }
};

const KeyboardChecker = (keyboard) => {
    const result = keyboardJson.find((value) => value === keyboard);
    return (result) ? true : false;
};

const ignoreConversation = async (ctx, next) => {
    try {
        const activeConversation = await ctx.conversation.active();

        if (!Object.keys(activeConversation)[0]) return await next();

        const keys = Object.keys(activeConversation)[0];

        if (keys && ctx.message?.text == "❌Cancel") {
            await ctx.conversation.exit();
            return await ctx.reply(`Your request has been ❌ Cancelled`, {
                reply_markup: {
                    keyboard: StartKeyboard,
                    resize_keyboard: true
                }
            });
        }

        if (keys && ctx.has("callback_query")) {
            await ctx.conversation.exit();
        }

        if (keys && KeyboardChecker(ctx.message?.text)) {
            await ctx.conversation.exit();
        }

        await next();

    } catch (error) {
        await TryCatchError(error);
    }
};

module.exports = { constraints, isClicked, isNewUser, isBanned, isAdmin, isSubscribed, ignoreConversation };