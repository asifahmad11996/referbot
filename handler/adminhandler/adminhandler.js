
const Userinfo = require("../../database/userinfoSchema");
const Subscriptioninfo = require("../../database/subscriptioninfoSchema");

const { TryCatchError } = require("../errorhandler/errorhandler");

const { AdminPanelKeyboard, ChannelsKeyboard, CancelKeyboard, StartKeyboard } = require("../../keyboard/keyboard");
const { AdminPanelMessage } = require("../../message/message");

const BOT_NAME = process.env.BOT_NAME;

const AdminPanel = async (ctx) => {
    try {
        if (ctx.has("callback_query")) {
            return await ctx.editMessageText(AdminPanelMessage, {
                parse_mode: "HTML",
                reply_markup: {
                    inline_keyboard: AdminPanelKeyboard
                }
            });
        }

        await ctx.reply(AdminPanelMessage, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: AdminPanelKeyboard
            }
        });

    } catch (error) {
        await TryCatchError(error);
    }
};

const BotStatistics = async (ctx) => {
    try {
        const total_user = await Userinfo.countDocuments({});
        const subscribed_user = await Userinfo.countDocuments({ is_subscribed: true });
        const blocked_user = await Userinfo.countDocuments({ is_blocked: true });
        const active_user = Number(total_user - blocked_user);

        const message = `<b><u>📊 BOT STATISTICS</u></b>\n\n<b>▪️ Total Users :</b> ${total_user}\n<b>▫️ Active Users :</b> ${active_user}\n<b>▪️ Subscribed Users :</b> ${subscribed_user}\n<b>▫️ Block Users :</b> ${blocked_user}`;

        await ctx.editMessageText(message, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: AdminPanelKeyboard
            }
        });
    } catch (error) {
        await TryCatchError(error);
    }
};

const UserDetails = async (ctx) => {
    try {
        const match = ctx.match;

        const user_id = match[0].split(" ")[1];

        const user = await Userinfo.findOne({ user_id });

        if (!user) return await ctx.reply(`User not found`);

        let message = `<b><u>User Basic Info</u></b>\n`;

        let entries = Object.entries(user?._doc);

        entries.map((v) => {
            message = `${message.replace(",", " : ")}\n` + v.toString().replace(",", " : ");
        });

        await ctx.reply(message, {
            parse_mode: "HTML"
        });

    } catch (error) {
        await TryCatchError(error);
    }
};

const CommandGuide = async (ctx) => {
    try {
        const message = `Here you can see command templates :\n\nFor refund users you can use below command :\n<code>/refund userId amount -flag</code>\n\nTo check a user details you can use below command :\n<code>/userinfo userId</code>\n\nTo ban/unban a user you can use below command :\n<code>/ban userId [banReason] -flag</code>\n<code>/unban userId [unbanReason] -flag</code>\n\nTo send message specific user use below command :\n<code>/msg userId [message]</code>`;

        await ctx.editMessageText(message, {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: AdminPanelKeyboard
            }
        });

    } catch (error) {
        await TryCatchError(error);
    }
};

const BanUnban = async (ctx) => {
    try {
        const match = ctx.match;

        let is_banned = match[0].startsWith("/ban") ? true : false;

        const regex_user = /[0-9]+/g;
        const user_id = match[0]?.match(regex_user)?.[0];

        const regex_message = /\[(.*?)\]/g;
        const ban_reason = match[0]?.match(regex_message)?.[0].replace("[", "").replace("]", "") || "You are banned by admin";

        const regex_flag = /(-g|-w)/g;
        const flag = match[0]?.match(regex_flag)?.[0];

        const query = (flag == `-g`) ? { is_banned, ban_reason } : (flag == `-w`) ? { can_withdraw: !is_banned, withdraw_ban_reason: ban_reason } : false;

        if (!query) return await ctx.reply(`Wrong format!`);

        const updated = await Userinfo.findOneAndUpdate({ user_id }, { $set: query }, { new: true });

        if (!updated) return await ctx.reply(`Someting wrong!`);

        const ban = (flag == "-g") ? `${(is_banned) ? `Banned In Bot for ${ban_reason}` : "Unbanned In Bot"}` : `${(!is_banned) ? `Banned In Withdraw for ${ban_reason}` : "Unbanned In Withdraw"}`;

        await ctx.reply(`<code>${user_id}</code> has been ${ban}`, {
            parse_mode: "HTML",
            disable_web_page_preview: true
        });

        await ctx.api.sendMessage(user_id, `You are ${ban}`, {
            parse_mode: "HTML",
            disable_web_page_preview: true
        });

    } catch (error) {
        await TryCatchError(error);
    }
};

const CustomMessage = async (ctx) => {
    try {
        const match = ctx.match || '';
        const regex_user = /[0-9]+/g;
        const userId = match[0]?.match(regex_user)?.[0];
        const regex_message = /\[(.*?)\]/g;
        let message = match[0]?.match(regex_message)?.[0].replace("[", "").replace("]", "") || "Hello";

        await ctx.api.sendMessage(userId, message, {
            parse_mode: "HTML",
            disable_web_page_preview: true
        });

        await ctx.reply(`Message has been sent to <code>${userId}</code>`, {
            parse_mode: "HTML",
            disable_web_page_preview: true
        });

    } catch (error) {
        await TryCatchError(error);
    }
};

const Channels = async (ctx) => {
    try {
        const data = await Subscriptioninfo.find({});
        let message = `<b>Here are your all active channels :</b>\n`;

        for (const iterator of data) {
            message += `\n${iterator.checking ? "🟢" : "⛔️"} <a href="${iterator.chat_link}">${iterator.anchor_data}</a>`;
        }

        await ctx.editMessageText(message, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
            reply_markup: {
                inline_keyboard: ChannelsKeyboard
            }
        });
    } catch (error) {
        await TryCatchError(error);
    }
};

const AddChannel = async (ctx) => {
    try {
        await ctx.reply(`Send me the chat id or link or username ...`, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: CancelKeyboard,
                resize_keyboard: true,
                input_field_placeholder: `Enter the chat id or link or username ....`
            }
        });

        await ctx.conversation.enter("NewChannel");

    } catch (error) {
        await TryCatchError(error);
    }
};

const ChatAdministrator = async (api, chat_id) => {
    try {
        const { id } = await api.getMe();

        const Chat = await api.getChatMember(chat_id, id);

        return (Chat.status == `administrator`);

    } catch (error) {
        return false;
    }
};

const createUserName = (chat) => {
    try {
        const isHTTP = chat.startsWith("http://t.me/") ? chat : false;
        const isHTTPS = chat.startsWith("https://t.me/") ? chat : false;
        const isChatId = chat.startsWith("-100") ? chat : false;
        const isChatName = chat.startsWith("@") ? chat : false;

        const replacing = (isHTTP) ? chat.replace(`http://t.me/`, "@") : (isHTTPS) ? chat.replace(`https://t.me/`, "@") : (isChatId) ? isChatId : (isChatName) ? isChatName : `@${chat}`;
        const createUserName = (replacing.includes("/")) ? replacing.split("/")[0] : replacing;

        return createUserName;

    } catch (error) {
        return false;
    }
};

const ExploreChatId = async (api, chat) => {
    try {
        const Chat = await api.getChat(chat);
        return Chat.id;

    } catch (error) {
        return false;
    }
};

const ExtractChatLink = async (api, chat_id) => {
    try {
        const Chat = await api.getChat(chat_id);

        const isChat = (chat_id.toString().startsWith("-100"));

        if (!isChat) return false;

        if (Chat?.username) {
            return `https://t.me/${Chat?.username}`;
        }

        if (Chat?.invite_link) {
            return Chat?.invite_link;
        }

        return false;

    } catch (error) {
        return false;
    }
};

const isAdsChatValid = async (api, chat) => {
    try {
        const UserName = createUserName(chat);

        const isChatAdmin = await ChatAdministrator(api, UserName);

        if (!isChatAdmin) return false;

        const chat_id = await ExploreChatId(api, UserName);
        return chat_id;

    } catch (error) {
        return false;
    }
};

const NewChannel = async (conversation, ctx) => {
    try {
        ctx = await conversation.wait();

        const chat_id = await isAdsChatValid(ctx.api, ctx.message?.text);

        if (!chat_id) {
            await ctx.reply(`<b>⚠️ Attention !!!</b>\n\nYou must make @${BOT_NAME} an administrator of your chat.\n\n<i>This is needed to verify that users joined your chat.</i>`, {
                parse_mode: "HTML",
                reply_markup: {
                    keyboard: CancelKeyboard,
                    resize_keyboard: true
                }
            });
            return NewChannel(conversation, ctx);
        }

        const chat_link = await ExtractChatLink(ctx.api, chat_id);
        const data = await ctx.api.getChat(chat_id);

        const isExists = await Subscriptioninfo.exists({ chat_id });

        if (isExists) return await ctx.reply(`This chat already added!`, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: StartKeyboard,
                resize_keyboard: true
            }
        });

        await Subscriptioninfo.create({
            chat_id, anchor_data: data.title, chat_link
        });

        await ctx.reply(`${ctx.message.text} added successfully!`, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: StartKeyboard,
                resize_keyboard: true
            }
        });
    } catch (error) {
        await TryCatchError(error);
    }
};

const RemoveChannel = async (ctx) => {
    try {
        await ctx.reply(`Send me the chat id or link or username ...`, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: CancelKeyboard,
                resize_keyboard: true,
                input_field_placeholder: `Enter the chat id or link or username ....`
            }
        });

        await ctx.conversation.enter("DeleteChannel");
    } catch (error) {
        await TryCatchError(error);
    }
};

const DeleteChannel = async (conversation, ctx) => {
    try {
        ctx = await conversation.wait();

        const chat = ctx.message.text;

        const UserName = await createUserName(chat);

        const chat_id = await ExploreChatId(ctx.api, UserName);

        await Subscriptioninfo.deleteOne({ chat_id });

        await ctx.reply(`${UserName} removed successfully!`, {
            parse_mode: "HTML",
            reply_markup: {
                keyboard: StartKeyboard,
                resize_keyboard: true
            }
        });

    } catch (error) {
        await TryCatchError(error);
    }
};

module.exports = { AdminPanel, BotStatistics, UserDetails, CommandGuide, BanUnban, CustomMessage, Channels, AddChannel, NewChannel, RemoveChannel, DeleteChannel };